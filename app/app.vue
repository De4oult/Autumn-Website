<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup lang="ts">
    const config = useRuntimeConfig()
    const { t, locale, locales } = useI18n()
    const localeHead = useLocaleHead({
        seo : true
    })

    const siteName = `${config.public.name} Framework`
    const siteUrl = config.public.url
    const socialImage = `${siteUrl}/autumn_og_card.png`
    const socialImageWidth = '1200'
    const socialImageHeight = '630'

    const description = computed(() => t('seo.site.description'))
    const socialImageAlt = computed(() => t('seo.site.image_alt'))

    const currentLocaleConfig = computed(() => locales.value.find(option => {
        const code = typeof option === 'string' ? option : option.code

        return code === locale.value
    }))

    const currentLocaleLanguage = computed(() => {
        const option = currentLocaleConfig.value

        if(typeof option === 'string')
            return option

        return option?.language || option?.code || locale.value
    })

    const availableLanguages = computed(() => locales.value.map(option => typeof option === 'string'
        ? option
        : (option.language || option.code)))

    useHead(() => ({
        titleTemplate : title => title ? `${title} · ${siteName}` : siteName,
        htmlAttrs     : localeHead.value.htmlAttrs,
        link          : [...(localeHead.value.link || [])],
        meta          : [
            ...(localeHead.value.meta || []),
            { name : 'application-name', content : siteName },
            { name : 'apple-mobile-web-app-title', content : siteName },
            { name : 'author', content : config.public.author },
            { name : 'creator', content : config.public.author },
            { name : 'publisher', content : siteName },
            { name : 'robots', content : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
            { name : 'description', content : description.value },
            { property : 'og:site_name', content : siteName },
            { property : 'og:type', content : 'website' },
            { property : 'og:title', content : siteName },
            { property : 'og:description', content : description.value },
            { property : 'og:image', content : socialImage },
            { property : 'og:image:secure_url', content : socialImage },
            { property : 'og:image:type', content : 'image/png' },
            { property : 'og:image:width', content : socialImageWidth },
            { property : 'og:image:height', content : socialImageHeight },
            { property : 'og:image:alt', content : socialImageAlt.value },
            { name : 'twitter:card', content : 'summary_large_image' },
            { name : 'twitter:site', content : config.public.author },
            { name : 'twitter:creator', content : config.public.author },
            { name : 'twitter:title', content : siteName },
            { name : 'twitter:description', content : description.value },
            { name : 'twitter:image', content : socialImage },
            { name : 'twitter:image:alt', content : socialImageAlt.value }
        ],
        script : [
            {
                id          : 'autumn-schema',
                type        : 'application/ld+json',
                textContent : JSON.stringify([
                    {
                        '@context'  : 'https://schema.org',
                        '@type'     : 'WebSite',
                        name        : siteName,
                        url         : siteUrl,
                        description : description.value,
                        inLanguage  : currentLocaleLanguage.value,
                        image       : socialImage,
                        sameAs      : [
                            config.public.github,
                            config.public.authorGithub
                        ],
                        potentialLanguage : availableLanguages.value,
                        publisher         : {
                            '@type' : 'Organization',
                            name    : siteName,
                            sameAs  : [config.public.github],
                            logo    : `${siteUrl}/autumn.svg`,
                            image   : socialImage,
                            url     : siteUrl
                        }
                    },
                    {
                        '@context'          : 'https://schema.org',
                        '@type'             : 'SoftwareSourceCode',
                        name                : config.public.name,
                        codeRepository      : config.public.github,
                        description         : description.value,
                        programmingLanguage : 'Python',
                        runtimePlatform     : 'ASGI',
                        url                 : siteUrl,
                        image               : socialImage,
                        inLanguage          : currentLocaleLanguage.value,
                        author              : {
                            '@type' : 'Person',
                            name    : config.public.author
                        },
                        creator : {
                            '@type' : 'Person',
                            name    : config.public.author
                        },
                        license : config.public.license
                    }
                ])
            }
        ]
    }))
</script>
