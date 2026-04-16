<template>
    <div class="min-w-0">
        <div class="mb-5 max-w-3xl">
            <p class="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-autumn-accent">
                {{ activePart?.article.title }}
            </p>

            <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
                {{ activeTitle }}
            </h1>

            <p class="mt-4 text-lg leading-8 text-autumn-text-secondary">
                {{ activeDescription }}
            </p>
        </div>

        <div class="mb-5 flex flex-wrap gap-2">
            <span class="rounded-full border border-autumn-border bg-autumn-bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-autumn-accent">
                {{ activePart?.article.title }}
            </span>

            <span class="rounded-full border border-autumn-border bg-autumn-bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-autumn-text-secondary">
                {{ activePart?.chapter.title }}
            </span>
        </div>

        <div class="overflow-hidden rounded-xl border border-autumn-border bg-autumn-bg-card/45 shadow-[0_30px_100px_rgba(0,0,0,0.35)] backdrop-blur-xl">
            <div
                v-if="articleDocument"
                class="documentation-body px-6 pt-2 pb-6 sm:px-8"
            >
                <template
                    v-if="renderBlocks.length"
                >
                    <template
                        v-for="(block, index) in renderBlocks"
                        :key="`${activeDocumentPath || 'documentation-empty'}-${index}`"
                    >
                        <ContentRenderer
                            v-if="block.type === 'content'"
                            :value="block.document"
                        />

                        <DocumentationCode
                            v-else-if="block.type === 'tabs'"
                            class="documentation-code-block"
                            :tabs="block.tabs"
                        />
                    </template>
                </template>

                <ContentRenderer
                    v-else
                    :key="activeDocumentPath || 'documentation-empty'"
                    :value="articleDocument"
                />
            </div>

            <div
                v-else
                class="px-6 py-8 text-sm text-autumn-text-secondary sm:px-8"
            >
                {{ docsIndex.description }}
            </div>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <NuxtLink
                v-if="previousPart"

                :to="previousPart.href"

                class="mt-3 inline-flex items-center justify-center text-autumn-accent transition-colors duration-300 hover:cursor-pointer hover:text-autumn-accent-dark group"
            >
                <ArrowLeft
                    :size="22" 
                    class="mr-3 group-hover:animate-bounce-left" 
                />
                <div class="flex-col space-x-1 jusitfy-center">
                    {{ $t('page.documentation.previous') }} 
                    <p class="text-sm font-semibold text-autumn-text transition-colors group-hover:text-autumn-accent">
                        {{ previousPart.title }}
                    </p>
                </div>
            </NuxtLink>

            <div v-else class="hidden sm:block"></div>

            <NuxtLink
                v-if="nextPart"

                :to="nextPart.href"

                class="mt-3 inline-flex items-center justify-center text-autumn-accent transition-colors duration-300 hover:cursor-pointer hover:text-autumn-accent-dark group"
            >
                <div class="flex-col space-x-1 jusitfy-center">
                    {{ $t('page.documentation.next') }} 
                    <p class="text-sm font-semibold text-autumn-text transition-colors group-hover:text-autumn-accent">
                        {{ nextPart.title }}
                    </p>
                </div>
                <ArrowRight 
                    :size="22" 
                    class="ml-3 group-hover:animate-bounce-right" 
                />
            </NuxtLink>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { ArrowLeft, ArrowRight }     from 'lucide-vue-next'
    import type { DocumentationArticle } from '~/composables/useDocumentation'

    type DocumentationCodeTab = {
        name: string
        code: string
        lang: string
    }

    type MinimarkNode = string | [string, Record<string, unknown>, ...MinimarkNode[]]

    type ContentBody = {
        type?: string
        value?: MinimarkNode[]
    }

    type RenderBlock =
        | { type: 'content'; document: DocumentationArticle }
        | { type: 'tabs'; tabs: DocumentationCodeTab[] }

    const config = useRuntimeConfig()
    const { t } = useI18n()

    const {
        activeDocumentPath,
        activePart,
        docsIndex,
        nextPart,
        previousPart
    } = await useDocumentation()

    const siteName = `${config.public.name} Framework`

    const articleDocument = activeDocumentPath.value
        ? await queryCollection('content')
            .path(activeDocumentPath.value)
            .first() as DocumentationArticle | null
        : null

    if(activeDocumentPath.value && !articleDocument) {
        throw createError({
            statusCode    : 404,
            statusMessage : 'Documentation markdown file not found'
        })
    }

    const activeTitle = computed(() => articleDocument?.title || activePart.value?.title || docsIndex.value.title)
    const activeDescription = computed(() => articleDocument?.description || activePart.value?.description || docsIndex.value.description)

    const isElementNode = (node: MinimarkNode): node is [string, Record<string, unknown>, ...MinimarkNode[]] =>
        Array.isArray(node) && typeof node[0] === 'string'

    const getNodeTag = (node: MinimarkNode): string =>
        isElementNode(node) ? node[0] : ''

    const getNodeProps = (node: MinimarkNode): Record<string, unknown> =>
        isElementNode(node) ? node[1] || {} : {}

    const getNodeChildren = (node: MinimarkNode): MinimarkNode[] =>
        isElementNode(node) ? node.slice(2) : []

    const readMinimarkText = (node: MinimarkNode | MinimarkNode[]): string => {
        if(Array.isArray(node) && !isElementNode(node))
            return node.map(readMinimarkText).join('')

        if(typeof node === 'string')
            return node

        return getNodeChildren(node).map(readMinimarkText).join('')
    }

    const parseDocumentationCodeTabs = (node: MinimarkNode): DocumentationCodeTab[] => {
        if(getNodeTag(node) !== 'documentation-code')
            return []

        const tabs: DocumentationCodeTab[] = []
        let pendingName = ''
        let pendingLang = ''

        for(const child of getNodeChildren(node)) {
            if(getNodeTag(child) === 'p') {
                const text = readMinimarkText(child).trim()
                const match = text.match(/^@tab\s+(.+?)(?:\s+([a-z0-9_-]+))?$/i)

                if(match) {
                    pendingName = match[1]
                    pendingLang = match[2] || ''
                }

                continue
            }

            if(getNodeTag(child) !== 'pre')
                continue

            const props = getNodeProps(child)
            const code = typeof props.code === 'string' ? props.code : ''
            const lang = typeof props.language === 'string'
                ? props.language
                : pendingLang || 'text'

            if(!code)
                continue

            tabs.push({
                name : pendingName || `Tab ${tabs.length + 1}`,
                code,
                lang
            })

            pendingName = ''
            pendingLang = ''
        }

        return tabs
    }

    const renderBlocks = computed<RenderBlock[]>(() => {
        const body = articleDocument?.body as ContentBody | undefined
        const nodes = Array.isArray(body?.value) ? body.value : []

        if(!articleDocument || !nodes.some(node => getNodeTag(node) === 'documentation-code'))
            return []

        const blocks: RenderBlock[] = []
        let currentNodes: MinimarkNode[] = []

        const pushContentBlock = () => {
            if(!currentNodes.length || !articleDocument)
                return

            blocks.push({
                type     : 'content',
                document : {
                    ...articleDocument,
                    body : {
                        ...(body || {}),
                        value : [...currentNodes]
                    }
                }
            })

            currentNodes = []
        }

        for(const node of nodes) {
            if(getNodeTag(node) !== 'documentation-code') {
                currentNodes.push(node)
                continue
            }

            pushContentBlock()

            const tabs = parseDocumentationCodeTabs(node)

            if(tabs.length)
                blocks.push({ type : 'tabs', tabs })
        }

        pushContentBlock()

        return blocks
    })

    useHead(() => ({
        title : activePart.value
            ? `${activeTitle.value} · ${t('seo.documentation.title')}`
            : t('seo.documentation.title'),
        meta : [
            { name : 'description', content : activeDescription.value },
            { property : 'og:title', content : `${activeTitle.value} · ${siteName}` },
            { property : 'og:description', content : activeDescription.value },
            { name : 'twitter:title', content : `${activeTitle.value} · ${siteName}` },
            { name : 'twitter:description', content : activeDescription.value }
        ]
    }))
</script>

<style scoped>
    .documentation-body :deep(h2) {
        margin-top: 2.6rem;
        margin-bottom: 1rem;
        color: var(--color-autumn-text);
        font-size: clamp(1.45rem, 2vw, 1.8rem);
        font-weight: 700;
        letter-spacing: -0.02em;
    }

    .documentation-body :deep(h3) {
        margin-top: 2rem;
        margin-bottom: 0.85rem;
        color: var(--color-autumn-text);
        font-size: clamp(1.15rem, 1.5vw, 1.35rem);
        font-weight: 650;
    }

    .documentation-body :deep(h4),
    .documentation-body :deep(h5),
    .documentation-body :deep(h6) {
        margin-top: 1.6rem;
        margin-bottom: 0.7rem;
        color: var(--color-autumn-text);
        font-size: 1rem;
        font-weight: 650;
    }

    .documentation-body :deep(p),
    .documentation-body :deep(ul),
    .documentation-body :deep(ol),
    .documentation-body :deep(blockquote),
    .documentation-body :deep(table) {
        margin-top: 1.15rem;
    }

    .documentation-body :deep(p) {
        color: var(--color-autumn-text-secondary);
        line-height: 1.9;
    }

    .documentation-body :deep(strong) {
        color: var(--color-autumn-text);
        font-weight: 650;
    }

    .documentation-body :deep(a) {
        color: var(--color-autumn-accent);
        text-decoration: none;
        transition: color 160ms ease;
    }

    .documentation-body :deep(a:hover) {
        color: var(--color-autumn-accent-dark);
    }

    .documentation-body :deep(ul),
    .documentation-body :deep(ol) {
        padding-left: 1.3rem;
        color: var(--color-autumn-text-secondary);
        line-height: 1.8;
        list-style-position: outside;
    }

    .documentation-body :deep(ul) {
        list-style-type: disc;
    }

    .documentation-body :deep(ol) {
        list-style-type: decimal;
    }

    .documentation-body :deep(li)::marker {
        color: var(--color-autumn-text-secondary);
    }

    .documentation-body :deep(li + li) {
        margin-top: 0.5rem;
    }

    .documentation-body :deep(blockquote) {
        border-left: 3px solid rgba(243, 156, 18, 0.45);
        background: rgba(42, 35, 32, 0.6);
        border-radius: 1rem;
        padding: 1rem 1.1rem;
        color: var(--color-autumn-text);
    }

    .documentation-body :deep(hr) {
        margin-top: 2rem;
        margin-bottom: 2rem;
        border: 0;
        border-top: 1px solid var(--color-autumn-border);
    }

    .documentation-body :deep(table) {
        display: block;
        width: 100%;
        overflow-x: auto;
        border-collapse: collapse;
        border: 1px solid var(--color-autumn-border);
        border-radius: 1rem;
        background: rgba(42, 35, 32, 0.5);
    }

    .documentation-body :deep(th),
    .documentation-body :deep(td) {
        border-bottom: 1px solid var(--color-autumn-border);
        padding: 0.85rem 1rem;
        text-align: left;
        white-space: nowrap;
    }

    .documentation-body :deep(th) {
        color: var(--color-autumn-text);
        font-weight: 650;
    }

    .documentation-body :deep(td) {
        color: var(--color-autumn-text-secondary);
    }

    .documentation-body :deep(.documentation-inline-code) {
        border: 1px solid rgba(243, 156, 18, 0.16);
        border-radius: 0.65rem;
        background: rgba(26, 21, 18, 0.8);
        color: var(--color-autumn-accent);
        font-family: var(--font-mono);
        font-size: 0.92em;
        padding: 0.18rem 0.45rem;
    }

    .documentation-body :deep(.documentation-code-block) {
        margin-top: 1.6rem;
        margin-bottom: 1.6rem;
    }
</style>
