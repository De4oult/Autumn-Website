export type SeoDocumentationPart = {
    slug?: string
    document?: string
}

export type SeoDocumentationChapter = {
    slug?: string
    parts?: SeoDocumentationPart[]
}

export type SeoDocumentationSection = {
    slug?: string
    chapters?: SeoDocumentationChapter[]
}

export type SeoDocumentationPage = {
    navigation?: SeoDocumentationSection[] | boolean
}

export type DocumentationArticlePath = {
    path: string
    document?: string
}

export const collectDocumentationArticlePaths = (navigation: SeoDocumentationSection[]): DocumentationArticlePath[] => {
    const paths: DocumentationArticlePath[] = [];

    for(const section of navigation) {
        for(const chapter of section.chapters || []) {
            for(const part of chapter.parts || []) {
                if(!section.slug || !chapter.slug || !part.slug)
                    continue;

                paths.push({
                    path     : `/documentation/${section.slug}/${chapter.slug}/${part.slug}/`,
                    document : part.document
                });
            }
        }
    }

    return paths;
};
