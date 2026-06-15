import { readFileSync } from 'node:fs';
import { join }         from 'node:path';

import {
    collectDocumentationArticlePaths,
    type SeoDocumentationChapter,
    type SeoDocumentationPart,
    type SeoDocumentationSection
} from './shared/utils/documentation';
import { SEO_LOCALES } from './shared/utils/seo';

const PROJECT_ROOT = process.cwd();
const PYPI_PACKAGE_NAME = 'autumn-framework';
const FALLBACK_VERSION = 'v0.1.3';

type PyPiPackageInfo = {
    info?: {
        version?: string;
    };
};

const normalizeVersion = (version: string): string => version.startsWith('v') ? version : `v${version}`;

const fetchLatestPyPiVersion = async (): Promise<string> => {
    try {
        const response = await fetch(`https://pypi.org/pypi/${PYPI_PACKAGE_NAME}/json`, {
            signal : AbortSignal.timeout(5000)
        });

        if(!response.ok)
            return FALLBACK_VERSION;

        const data = await response.json() as PyPiPackageInfo;
        const version = data.info?.version;

        if(!version)
            return FALLBACK_VERSION;

        return normalizeVersion(version);
    } catch{
        return FALLBACK_VERSION;
    }
};

const latestVersion = await fetchLatestPyPiVersion();

const staticPrerenderRoutes = [
    '/robots.txt',
    '/sitemap.xml',
    '/',
    '/ru/',
    '/benchmarks/',
    '/ru/benchmarks/',
    '/documentation/',
    '/ru/documentation/',
    '/releases/',
    '/ru/releases/',
    '/roadmap/',
    '/ru/roadmap/'
];

const readDocumentationPrerenderRoutes = (): string[] => SEO_LOCALES.flatMap(locale => {
    const filePath = join(PROJECT_ROOT, 'content', locale, 'documentation.yml');
    const navigation = parseDocumentationNavigation(readFileSync(filePath, 'utf8'));

    return collectDocumentationArticlePaths(navigation)
        .map(article => locale === 'en'
            ? article.path
            : `/${locale}${article.path}`);
});

const parseDocumentationNavigation = (source: string): SeoDocumentationSection[] => {
    const navigation: SeoDocumentationSection[] = [];
    let currentSection: SeoDocumentationSection | null = null;
    let currentChapter: SeoDocumentationChapter | null = null;
    let currentPart: SeoDocumentationPart | null = null;

    for(const line of source.split(/\r?\n/)) {
        const slugMatch = line.match(/^(\s*)-\s+slug:\s+(.+?)\s*$/);
        const documentMatch = line.match(/^\s+document:\s+(.+?)\s*$/);

        if(slugMatch) {
            const indent = slugMatch[1]?.length || 0;
            const slug = slugMatch[2] || '';

            if(indent === 2) {
                currentSection = {
                    slug,
                    chapters : []
                };
                currentChapter = null;
                currentPart = null;
                navigation.push(currentSection);
                continue;
            }

            if(indent === 6 && currentSection) {
                currentChapter = {
                    slug,
                    parts : []
                };
                currentPart = null;
                currentSection.chapters?.push(currentChapter);
                continue;
            }

            if(indent === 10 && currentChapter) {
                currentPart = { slug };
                currentChapter.parts?.push(currentPart);
            }
        }

        if(documentMatch && currentPart)
            currentPart.document = documentMatch[1] || '';
    }

    return navigation;
};

export default defineNuxtConfig({
    compatibilityDate : '2024-04-03',
    devtools          : { enabled : false },
    
    modules : [
        '@nuxt/content',
        '@nuxt/eslint',
        '@nuxt/fonts',
        '@nuxt/image',
        '@nuxtjs/i18n',
        '@vueuse/nuxt',
        'nuxt-charts',
        'motion-v/nuxt'
    ],

    experimental : {
        payloadExtraction : false
    },

    runtimeConfig : {
        public : {
            url         : 'https://autumn.de4oult.online',
            description : 'Autumn is a modern Python web application framework with dependency injection, clean architecture, typed configuration, and a cozy developer experience.',
            
            name    : 'Autumn',
            version : latestVersion,
            license : 'MIT License',
            
            author       : '@de4oult',
            authorGithub : 'https://github.com/De4oult',

            github : 'https://github.com/De4oult/Autumn'
        }
    },
    
    i18n : {
        baseUrl               : 'https://autumn.de4oult.online',
        defaultLocale         : 'en',
        detectBrowserLanguage : false,
        locales               : [
            { code : 'en', language : 'en-US', file : 'english.json' },
            { code : 'ru', language : 'ru-RU', file : 'russian.json' }
        ],
        langDir      : 'locales',
        strategy      : 'prefix_except_default',
        trailingSlash : true,
        vueI18n       : './i18n.config.ts'
    },

    nitro : {
        prerender : {
            crawlLinks : true,
            routes     : [...staticPrerenderRoutes, ...readDocumentationPrerenderRoutes()]
        }
    },

    css : [
        '~/assets/styles/main.css'
    ],

    postcss : {
        plugins : {
            '@tailwindcss/postcss' : {}
        }
    },

    app : {
        head : {
            title     : 'Autumn Web Framework',
            htmlAttrs : {
                lang : 'en'
            },
            meta : [
                { name : 'viewport', content : 'width=device-width, initial-scale=1' }
            ],
            link : [
                { rel : 'icon', type : 'image/png', sizes : '48x48', href : '/favicon-48.png' },
                { rel : 'icon', type : 'image/png', sizes : '96x96', href : '/favicon-96.png' },
                { rel : 'icon', href : '/favicon.ico' },
                { rel : 'icon', type : 'image/svg+xml', href : '/autumn.svg' }
            ]
        }
    },

    fonts : {
        families : [
            {
                name     : 'Inter',
                provider : 'google'
            },
            {
                name     : 'JetBrains Mono',
                provider : 'google'
            }
        ],
        defaults : {
            weights : [200, 300, 400, 500, 600, 700, 800],
            styles  : ['normal'],
            subsets : ['latin','cyrillic']
        }
    }
});
