export const SEO_BASE_URL = 'https://autumn.de4oult.online';
export const SEO_SITE_NAME = 'Autumn Framework';
export const SEO_DEFAULT_LOCALE = 'en';
export const SEO_LOCALES = ['en', 'ru'] as const;
export const SEO_LOCALE_LANGUAGES = {
    en : 'en-US',
    ru : 'ru-RU'
} as const;

export type SeoLocale = typeof SEO_LOCALES[number]
export type SeoOgType = 'website' | 'article'

export type SeoAlternate = {
    hreflang: string
    href: string
}

export type SeoBreadcrumb = {
    name: string
    url: string
}

const TRAILING_SLASH_PATTERN = /\/+$/;

export const isSeoLocale = (value: string): value is SeoLocale =>
    SEO_LOCALES.includes(value as SeoLocale);

export const normalizeBaseUrl = (baseUrl: string): string =>
    baseUrl.replace(TRAILING_SLASH_PATTERN, '');

export const ensureLeadingSlash = (path: string): string =>
    path.startsWith('/') ? path : `/${path}`;

export const ensureTrailingSlash = (path: string): string => {
    const cleanPath = ensureLeadingSlash(path || '/');

    if(cleanPath === '/')
        return cleanPath;

    return cleanPath.endsWith('/') ? cleanPath : `${cleanPath}/`;
};

export const stripLocalePrefix = (path: string): string => {
    const normalizedPath = ensureTrailingSlash(path.split('?')[0]?.split('#')[0] || '/');
    const parts = normalizedPath.split('/').filter(Boolean);

    const localePrefix = parts[0];

    if(localePrefix && isSeoLocale(localePrefix))
        return ensureTrailingSlash(`/${parts.slice(1).join('/')}`);

    return normalizedPath;
};

export const buildLocalizedPath = (locale: SeoLocale, path: string): string => {
    const localPath = stripLocalePrefix(path);

    if(localPath === '/')
        return `/${locale}/`;

    return ensureTrailingSlash(`/${locale}${localPath}`);
};

export const buildAbsoluteUrl = (baseUrl: string, path: string): string =>
    `${normalizeBaseUrl(baseUrl)}${ensureTrailingSlash(path)}`;

export const buildCanonicalUrl = (baseUrl: string, locale: SeoLocale, path: string): string =>
    buildAbsoluteUrl(baseUrl, buildLocalizedPath(locale, path));

export const buildHreflangLinks = (baseUrl: string, path: string): SeoAlternate[] => {
    const links: SeoAlternate[] = [];

    for(const locale of SEO_LOCALES) {
        const href = buildCanonicalUrl(baseUrl, locale, path);

        links.push({ hreflang : locale, href });
        links.push({ hreflang : SEO_LOCALE_LANGUAGES[locale], href });
    }

    links.push({
        hreflang : 'x-default',
        href     : buildCanonicalUrl(baseUrl, SEO_DEFAULT_LOCALE, path)
    });

    return links;
};

export const getSeoLanguage = (locale: string): string =>
    isSeoLocale(locale) ? SEO_LOCALE_LANGUAGES[locale] : SEO_LOCALE_LANGUAGES[SEO_DEFAULT_LOCALE];

export const createWebsiteSchema = (
    url: string,
    name: string,
    description: string,
    language: string,
    image: string,
    sameAs: string[]
) => ({
    '@context' : 'https://schema.org',
    '@type'    : 'WebSite',
    name,
    url,
    description,
    inLanguage : language,
    image,
    sameAs     : sameAs.filter(Boolean)
});

export const createSoftwareSourceCodeSchema = (
    name: string,
    url: string,
    repository: string,
    description: string,
    language: string,
    author: string,
    license: string,
    image: string
) => ({
    '@context'          : 'https://schema.org',
    '@type'             : 'SoftwareSourceCode',
    name,
    url,
    codeRepository      : repository,
    description,
    programmingLanguage : 'Python',
    runtimePlatform     : 'ASGI',
    inLanguage          : language,
    image,
    author              : {
        '@type' : 'Person',
        name    : author
    },
    creator : {
        '@type' : 'Person',
        name    : author
    },
    license
});

export const createWebPageSchema = (
    url: string,
    name: string,
    description: string,
    language: string,
    websiteUrl: string
) => ({
    '@context' : 'https://schema.org',
    '@type'    : 'WebPage',
    url,
    name,
    description,
    inLanguage : language,
    isPartOf   : {
        '@type' : 'WebSite',
        url     : websiteUrl,
        name    : SEO_SITE_NAME
    }
});

export const createTechArticleSchema = (
    url: string,
    headline: string,
    description: string,
    language: string,
    websiteUrl: string
) => ({
    '@context' : 'https://schema.org',
    '@type'    : 'TechArticle',
    url,
    headline,
    name       : headline,
    description,
    inLanguage : language,
    isPartOf   : {
        '@type' : 'WebSite',
        url     : websiteUrl,
        name    : SEO_SITE_NAME
    }
});

export const createBreadcrumbListSchema = (breadcrumbs: SeoBreadcrumb[]) => ({
    '@context'      : 'https://schema.org',
    '@type'         : 'BreadcrumbList',
    itemListElement : breadcrumbs.map((breadcrumb, index) => ({
        '@type'  : 'ListItem',
        position : index + 1,
        name     : breadcrumb.name,
        item     : breadcrumb.url
    }))
});

export const escapeXml = (value: string): string =>
    value
        .replace(/&/g, '&amp;')
        .replace(/</g, '&lt;')
        .replace(/>/g, '&gt;')
        .replace(/"/g, '&quot;')
        .replace(/'/g, '&apos;');
