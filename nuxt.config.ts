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

    runtimeConfig : {
        public : {
            url         : 'https://autumn.de4oult.online',
            description : 'Autumn is a modern Python web application framework with dependency injection, clean architecture, typed configuration, and a cozy developer experience.',
            
            name    : 'Autumn',
            version : 'v0.1.1',
            license : 'MIT License',
            
            author       : '@de4oult',
            authorGithub : 'https://github.com/De4oult',

            github : 'https://github.com/De4oult/Autumn'
        }
    },
    
    i18n : {
        baseUrl               : 'https://autumn.de4oult.online',
        defaultLocale         : 'en',
        detectBrowserLanguage : {
            fallbackLocale : 'en'
        },
        locales : [
            { code : 'en', language : 'en-US', file : 'english.json' },
            { code : 'ru', language : 'ru-RU', file : 'russian.json' }
        ],
        langDir      : 'locales',
        rootRedirect : {
            statusCode : 301,
            path       : '/'
        },
        strategy      : 'prefix',
        trailingSlash : true,
        vueI18n       : './i18n.config.ts'
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
