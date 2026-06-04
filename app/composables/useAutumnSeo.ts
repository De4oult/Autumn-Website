import { toValue, type MaybeRefOrGetter } from 'vue'

import {
    SEO_DEFAULT_LOCALE,
    buildCanonicalUrl,
    buildHreflangLinks,
    buildLocalizedPath,
    createBreadcrumbListSchema,
    createSoftwareSourceCodeSchema,
    createTechArticleSchema,
    createWebPageSchema,
    createWebsiteSchema,
    getSeoLanguage,
    isSeoLocale,
    stripLocalePrefix,
    type SeoBreadcrumb,
    type SeoOgType
} from '~~/shared/utils/seo'

type AutumnSeoBreadcrumbInput = {
    name: string
    path: string
}

type AutumnSeoOptions = {
    title: MaybeRefOrGetter<string>
    description: MaybeRefOrGetter<string>
    socialTitle?: MaybeRefOrGetter<string | undefined>
    socialDescription?: MaybeRefOrGetter<string | undefined>
    path?: MaybeRefOrGetter<string | undefined>
    ogType?: MaybeRefOrGetter<SeoOgType>
    breadcrumbs?: MaybeRefOrGetter<AutumnSeoBreadcrumbInput[] | undefined>
    article?: MaybeRefOrGetter<boolean | undefined>
}

export const useAutumnSeo = (options: MaybeRefOrGetter<AutumnSeoOptions>) => {
    const route = useRoute()
    const config = useRuntimeConfig()
    const { locale, t } = useI18n()

    useHead(() => {
        const seo = toValue(options)
        const localeCode = isSeoLocale(locale.value) ? locale.value : SEO_DEFAULT_LOCALE
        const language = getSeoLanguage(localeCode)
        const baseUrl = config.public.url
        const siteName = `${config.public.name} Framework`
        const siteUrl = buildCanonicalUrl(baseUrl, SEO_DEFAULT_LOCALE, '/')
        const socialImage = `${baseUrl}/autumn_og_card.png`
        const title = toValue(seo.title)
        const description = toValue(seo.description)
        const socialTitle = toValue(seo.socialTitle) || title
        const socialDescription = toValue(seo.socialDescription) || description
        const pagePath = toValue(seo.path) || stripLocalePrefix(route.path)
        const canonical = buildCanonicalUrl(baseUrl, localeCode, pagePath)
        const hreflangs = buildHreflangLinks(baseUrl, pagePath)
        const isArticle = toValue(seo.article)
        const ogType = toValue(seo.ogType) || (isArticle ? 'article' : 'website')
        const fullTitle = socialTitle ? `${socialTitle} · ${siteName}` : siteName
        const rawBreadcrumbs = toValue(seo.breadcrumbs) || []
        const breadcrumbs: SeoBreadcrumb[] = rawBreadcrumbs.map(item => ({
            name : item.name,
            url  : buildAbsoluteBreadcrumbUrl(baseUrl, localeCode, item.path)
        }))
        const schema: Record<string, unknown>[] = [
            createWebsiteSchema(
                siteUrl,
                siteName,
                t('seo.site.description'),
                language,
                socialImage,
                [config.public.github, config.public.authorGithub]
            ),
            createSoftwareSourceCodeSchema(
                config.public.name,
                siteUrl,
                config.public.github,
                t('seo.site.description'),
                language,
                config.public.author,
                config.public.license,
                socialImage
            ),
            isArticle
                ? createTechArticleSchema(canonical, title, description, language, siteUrl)
                : createWebPageSchema(canonical, fullTitle, description, language, siteUrl)
        ]

        if(breadcrumbs.length)
            schema.push(createBreadcrumbListSchema(breadcrumbs))

        return {
            title,
            htmlAttrs : {
                lang : language
            },
            link : [
                {
                    key : 'canonical',
                    rel : 'canonical',
                    href: canonical
                },
                ...hreflangs.map(alternate => ({
                    key      : `alternate-${alternate.hreflang}`,
                    rel      : 'alternate',
                    hreflang : alternate.hreflang,
                    href     : alternate.href
                }))
            ],
            meta : [
                { key : 'description', name : 'description', content : description },
                { key : 'robots', name : 'robots', content : 'index, follow, max-image-preview:large, max-snippet:-1, max-video-preview:-1' },
                { key : 'application-name', name : 'application-name', content : siteName },
                { key : 'apple-mobile-web-app-title', name : 'apple-mobile-web-app-title', content : siteName },
                { key : 'author', name : 'author', content : config.public.author },
                { key : 'creator', name : 'creator', content : config.public.author },
                { key : 'og-site-name', property : 'og:site_name', content : siteName },
                { key : 'og-type', property : 'og:type', content : ogType },
                { key : 'og-title', property : 'og:title', content : fullTitle },
                { key : 'og-description', property : 'og:description', content : socialDescription },
                { key : 'og-url', property : 'og:url', content : canonical },
                { key : 'og-image', property : 'og:image', content : socialImage },
                { key : 'og-image-secure-url', property : 'og:image:secure_url', content : socialImage },
                { key : 'og-image-type', property : 'og:image:type', content : 'image/png' },
                { key : 'og-image-width', property : 'og:image:width', content : '1200' },
                { key : 'og-image-height', property : 'og:image:height', content : '630' },
                { key : 'og-image-alt', property : 'og:image:alt', content : t('seo.site.image_alt') },
                { key : 'twitter-card', name : 'twitter:card', content : 'summary_large_image' },
                { key : 'twitter-site', name : 'twitter:site', content : config.public.author },
                { key : 'twitter-creator', name : 'twitter:creator', content : config.public.author },
                { key : 'twitter-title', name : 'twitter:title', content : fullTitle },
                { key : 'twitter-description', name : 'twitter:description', content : socialDescription },
                { key : 'twitter-image', name : 'twitter:image', content : socialImage },
                { key : 'twitter-image-alt', name : 'twitter:image:alt', content : t('seo.site.image_alt') }
            ],
            script : [
                {
                    id          : 'autumn-schema',
                    key         : 'autumn-schema',
                    type        : 'application/ld+json',
                    textContent : JSON.stringify(schema)
                }
            ]
        }
    })
}

const buildAbsoluteBreadcrumbUrl = (baseUrl: string, locale: 'en' | 'ru', path: string): string =>
    `${baseUrl.replace(/\/+$/, '')}${buildLocalizedPath(locale, path)}`
