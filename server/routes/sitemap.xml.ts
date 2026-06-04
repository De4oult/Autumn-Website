import { stat } from 'node:fs/promises';
import { join } from 'node:path';

import { queryCollection } from '@nuxt/content/server';
import type { H3Event }    from 'h3';

import {
    collectDocumentationArticlePaths,
    type SeoDocumentationPage
} from '~~/shared/utils/documentation';
import {
    SEO_LOCALES,
    buildCanonicalUrl,
    buildHreflangLinks,
    escapeXml,
    type SeoLocale
} from '~~/shared/utils/seo';

type ChangeFrequency = 'daily' | 'weekly' | 'monthly' | 'yearly'

type SitemapEntry = {
    path: string
    locale: SeoLocale
    lastmod: string
    changefreq: ChangeFrequency
    priority: number
}

type LogicalPage = {
    path: string
    changefreq: ChangeFrequency
    priority: number
    sourceByLocale?: Partial<Record<SeoLocale, string>>
}

const CONTENT_ROOT = join(process.cwd(), 'content');
const BUILD_DATE = new Date().toISOString();

const staticPages: LogicalPage[] = [
    {
        path           : '/',
        changefreq     : 'weekly',
        priority       : 1,
        sourceByLocale : {
            en : join(process.cwd(), 'app/pages/index.vue'),
            ru : join(process.cwd(), 'app/pages/index.vue')
        }
    },
    {
        path           : '/benchmarks/',
        changefreq     : 'monthly',
        priority       : 0.7,
        sourceByLocale : {
            en : join(process.cwd(), 'app/pages/benchmarks.vue'),
            ru : join(process.cwd(), 'app/pages/benchmarks.vue')
        }
    },
    {
        path           : '/documentation/',
        changefreq     : 'weekly',
        priority       : 0.95,
        sourceByLocale : {
            en : join(CONTENT_ROOT, 'en/documentation.yml'),
            ru : join(CONTENT_ROOT, 'ru/documentation.yml')
        }
    },
    {
        path           : '/releases/',
        changefreq     : 'weekly',
        priority       : 0.75,
        sourceByLocale : {
            en : join(CONTENT_ROOT, 'en/releases.yml'),
            ru : join(CONTENT_ROOT, 'ru/releases.yml')
        }
    },
    {
        path           : '/roadmap/',
        changefreq     : 'monthly',
        priority       : 0.7,
        sourceByLocale : {
            en : join(CONTENT_ROOT, 'en/roadmap.yml'),
            ru : join(CONTENT_ROOT, 'ru/roadmap.yml')
        }
    }
];

export default defineEventHandler(async (event) => {
    const config = useRuntimeConfig(event);
    const baseUrl = String(config.public.url || 'https://autumn.de4oult.online');
    const logicalPages = await getLogicalPages(event);
    const entries: SitemapEntry[] = [];

    for(const page of logicalPages) {
        for(const locale of SEO_LOCALES) {
            entries.push({
                path       : page.path,
                locale,
                changefreq : page.changefreq,
                priority   : page.priority,
                lastmod    : await getLastmod(page.sourceByLocale?.[locale])
            });
        }
    }

    setHeader(event, 'Content-Type', 'application/xml; charset=utf-8');

    return [
        '<?xml version="1.0" encoding="UTF-8"?>',
        '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">',
        ...entries.map(entry => renderSitemapEntry(baseUrl, entry)),
        '</urlset>'
    ].join('\n');
});

const getLogicalPages = async (event: H3Event): Promise<LogicalPage[]> => {
    const pages = new Map<string, LogicalPage>();

    for(const page of staticPages)
        pages.set(page.path, page);

    for(const locale of SEO_LOCALES) {
        const documentation = await queryCollection(event, 'content')
            .path(`/${locale}/documentation`)
            .first() as SeoDocumentationPage | null;
        const navigation = Array.isArray(documentation?.navigation) ? documentation.navigation : [];

        for(const article of collectDocumentationArticlePaths(navigation)) {
            if(!article.document)
                continue;

            const sourcePath = join(CONTENT_ROOT, locale, 'docs', `${article.document}.md`);
            const existingPage = pages.get(article.path) || {
                path           : article.path,
                changefreq     : 'monthly',
                priority       : 0.82,
                sourceByLocale : {}
            };

            existingPage.sourceByLocale = {
                ...existingPage.sourceByLocale,
                [locale] : sourcePath
            };
            pages.set(article.path, existingPage);
        }
    }

    return [...pages.values()];
};

const getLastmod = async (path?: string): Promise<string> => {
    if(!path)
        return BUILD_DATE;

    try {
        return (await stat(path)).mtime.toISOString();
    } catch{
        return BUILD_DATE;
    }
};

const renderSitemapEntry = (baseUrl: string, entry: SitemapEntry): string => {
    const loc = buildCanonicalUrl(baseUrl, entry.locale, entry.path);
    const alternates = buildHreflangLinks(baseUrl, entry.path)
        .map(alternate => `    <xhtml:link rel="alternate" hreflang="${escapeXml(alternate.hreflang)}" href="${escapeXml(alternate.href)}" />`)
        .join('\n');

    return [
        '  <url>',
        `    <loc>${escapeXml(loc)}</loc>`,
        `    <lastmod>${escapeXml(entry.lastmod)}</lastmod>`,
        `    <changefreq>${entry.changefreq}</changefreq>`,
        `    <priority>${entry.priority.toFixed(2)}</priority>`,
        alternates,
        '  </url>'
    ].join('\n');
};
