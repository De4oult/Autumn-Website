export type DocumentationPart = {
    slug: string;
    title: string;
    description?: string;
    document: string;
};

export type DocumentationChapter = {
    slug: string;
    title: string;
    description?: string;
    parts: DocumentationPart[];
};

export type DocumentationSection = {
    slug: string;
    title: string;
    description?: string;
    chapters: DocumentationChapter[];
};

type DocumentationRouterContent = {
    title?: string;
    description?: string;
    eyebrow?: string;
    navigation?: DocumentationSection[] | boolean;
    meta?: {
        eyebrow?: string;
    };
};

export type DocumentationArticle = {
    title?: string;
    description?: string;
    body?: unknown;
};

export type ResolvedDocumentationPart = DocumentationPart & {
    article: DocumentationSection;
    chapter: DocumentationChapter;
    href: string;
    index: number;
    segments: string[];
};

export const useDocumentation = async () => {
    const route = useRoute();
    const localePath = useLocalePath();
    const config = useRuntimeConfig();
    const { locale, t } = useI18n();

    const siteName = `${config.public.name} Framework`;

    const routeSegments = computed<string[]>(() => {
        const slug = route.params.slug;

        if(Array.isArray(slug))
            return slug.filter(Boolean);

        if(typeof slug === 'string' && slug.length > 0)
            return [slug];

        return [];
    });

    const documentationRouterKey = computed(() => `documentation-router-${locale.value}`);

    const { data: docsRouter } = await useAsyncData<DocumentationRouterContent | null>(
        documentationRouterKey,
        () => queryCollection('content')
            .path(`/${locale.value}/documentation`)
            .first() as Promise<DocumentationRouterContent | null>,
        {
            watch : [locale]
        }
    );

    const docsIndex = computed(() => ({
        title       : docsRouter.value?.title || t('page.documentation.title'),
        description : docsRouter.value?.description || t('page.documentation.subtitle')
    }));

    const pageEyebrow = computed(() =>
        docsRouter.value?.meta?.eyebrow
        || docsRouter.value?.eyebrow
        || t('page.documentation.eyebrow'));

    const navigation = computed<DocumentationSection[]>(() => {
        const sections = docsRouter.value?.navigation;

        return Array.isArray(sections) ? sections : [];
    });

    const toPartPath = (segments: string[]): string => localePath(`/documentation/${segments.join('/')}`);

    const flatParts = computed<ResolvedDocumentationPart[]>(() => {
        let index = 0;

        return navigation.value.flatMap(article => article.chapters.flatMap(chapter => chapter.parts.map(part => {
            const segments = [article.slug, chapter.slug, part.slug];

            return {
                ...part,
                article,
                chapter,
                segments,
                href  : toPartPath(segments),
                index : index++
            };
        })));
    });

    const activePart = computed<ResolvedDocumentationPart | null>(() => {
        if(!flatParts.value.length)
            return null;

        if(routeSegments.value.length === 0)
            return flatParts.value[0];

        if(routeSegments.value.length > 3)
            return null;

        const [articleSlug, chapterSlug, partSlug] = routeSegments.value;
        const articleParts = flatParts.value.filter(part => part.article.slug === articleSlug);

        if(!articleParts.length)
            return null;

        if(!chapterSlug)
            return articleParts[0];

        const chapterParts = articleParts.filter(part => part.chapter.slug === chapterSlug);

        if(!chapterParts.length)
            return null;

        if(!partSlug)
            return chapterParts[0];

        return chapterParts.find(part => part.slug === partSlug) || null;
    });

    if(!flatParts.value.length) {
        throw createError({
            statusCode    : 404,
            statusMessage : 'Documentation content is empty'
        });
    }

    if(routeSegments.value.length > 0 && !activePart.value) {
        throw createError({
            statusCode    : 404,
            statusMessage : 'Documentation article not found'
        });
    }

    const activeDocumentPath = computed(() => activePart.value
        ? `/${locale.value}/docs/${activePart.value.document}`
        : null);

    const previousPart = computed(() => {
        const index = activePart.value?.index ?? 0;

        return index > 0 ? flatParts.value[index - 1] : null;
    });

    const nextPart = computed(() => {
        const index = activePart.value?.index ?? 0;

        return index < flatParts.value.length - 1 ? flatParts.value[index + 1] : null;
    });

    const isActivePart = (articleSlug: string, chapterSlug: string, partSlug: string): boolean =>
        activePart.value?.segments.join('/') === [articleSlug, chapterSlug, partSlug].join('/');

    return {
        activeDocumentPath,
        activePart,
        docsIndex,
        flatParts,
        isActivePart,
        navigation,
        nextPart,
        pageEyebrow,
        previousPart,
        routeSegments,
        siteName,
        toPartPath
    };
};
