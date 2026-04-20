const documentationRoutes = [
    '/documentation',
    '/documentation/get-started/installation/local-setup',
    '/documentation/get-started/installation/first-app',
    '/documentation/get-started/first-controller/hello-controller',
    '/documentation/get-started/first-service/minimal-service',
    '/documentation/get-started/first-service/service-injection',
    '/documentation/get-started/final-assembly/wiring-everything'
]

const sitemapUrls = [
    '/en',
    '/ru',
    ...documentationRoutes.flatMap(route => [`/en${route}`, `/ru${route}`])
]

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
        'motion-v/nuxt',
        '@nuxtjs/sitemap'
    ],

    runtimeConfig : {
        public : {
            url         : 'https://autumnframework.web.app',
            description : 'Autumn is a modern Python web application framework with dependency injection, clean architecture, typed configuration, and a cozy developer experience.',
            
            name    : 'Autumn',
            version : 'v0.1.0',
            license : 'MIT License',
            
            author       : '@de4oult',
            authorGithub : 'https://github.com/De4oult',

            github : 'https://github.com/De4oult/Autumn'
        }
    },
    
    i18n : {
        baseUrl               : 'https://autumnframework.web.app',
        defaultLocale         : 'en',
        detectBrowserLanguage : {
            fallbackLocale : 'en'
        },
        locales : [
            { code : 'en', language : 'en-US', file : 'english.json' },
            { code : 'ru', language : 'ru-RU', file : 'russian.json' }
        ],
        langDir  : 'locales',
        strategy : 'prefix',
        vueI18n  : './i18n.config.ts'
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
            title     : 'Autumn Framework',
            htmlAttrs : {
                lang : 'en'
            },
            meta : [
                { name : 'viewport', content : 'width=device-width, initial-scale=1' }
            ],
            link : [
                { rel : 'icon', type : 'image/svg+xml', href : '/autumn.svg' }
            ]
        }
    },

    site : {
        url  : 'https://autumnframework.web.app',
        name : 'Autumn Framework'
    },

    sitemap : {
        urls : sitemapUrls,
        xsl : false
    },

    nitro : {
        prerender : {
            routes : [
                '/sitemap_index.xml',
                '/__sitemap__/en-US.xml',
                '/__sitemap__/ru-RU.xml'
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
