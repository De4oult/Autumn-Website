<template>
    <div class="min-w-0">
        <div class="mb-5 max-w-3xl">
            <p class="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-autumn-accent">
                {{ activePart?.article.title || pageEyebrow }}
            </p>

            <h1 class="text-4xl font-bold tracking-tight sm:text-5xl">
                {{ activeTitle }}
            </h1>

            <p class="mt-4 text-lg leading-8 text-autumn-text-secondary">
                {{ activeDescription }}
            </p>
        </div>

        <div class="mb-5 flex flex-wrap gap-2">
            <span
                v-if="activePart"
                class="rounded-full border border-autumn-border bg-autumn-bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-autumn-accent"
            >
                {{ activePart?.article.title }}
            </span>

            <span
                v-if="activePart"
                class="rounded-full border border-autumn-border bg-autumn-bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-autumn-text-secondary"
            >
                {{ activePart?.chapter.title }}
            </span>

            <span
                v-if="!activePart"
                class="rounded-full border border-autumn-border bg-autumn-bg-card/50 px-3 py-1 text-xs font-semibold uppercase tracking-[0.16em] text-autumn-accent"
            >
                {{ formatArticleCount(flatParts.length) }}
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
                <div
                    v-if="!activePart"
                    class="space-y-8"
                >
                    <div class="max-w-2xl">
                        <p class="text-base leading-8">
                            {{ $t('page.documentation.index_overview') }}
                        </p>

                        <NuxtLink
                            v-if="firstPart"
                            :to="firstPart.href"
                            class="mt-6 inline-flex items-center text-autumn-accent transition-colors duration-300 hover:text-autumn-accent-dark group"
                        >
                            <span class="font-semibold">{{ $t('page.documentation.index_start') }}</span>
                            <ArrowRight
                                :size="20"
                                class="ml-3 group-hover:animate-bounce-right"
                            />
                        </NuxtLink>
                    </div>

                    <div>
                        <h2 class="text-sm font-semibold uppercase tracking-[0.18em] text-autumn-text">
                            {{ $t('page.documentation.index_sections') }}
                        </h2>

                        <div class="mt-4 grid gap-3 md:grid-cols-2">
                            <NuxtLink
                                v-for="section in indexSections"
                                :key="section.slug"
                                :to="section.href"
                                class="group rounded-xl border border-autumn-border bg-autumn-bg/35 p-4 transition-colors duration-300 hover:border-autumn-accent/45"
                            >
                                <div class="flex items-start justify-between gap-4">
                                    <div>
                                        <h3 class="text-base font-semibold text-autumn-text transition-colors group-hover:text-autumn-accent">
                                            {{ section.title }}
                                        </h3>

                                        <p class="mt-2 text-sm leading-6 text-autumn-text-secondary">
                                            {{ section.chapterTitles }}
                                        </p>
                                    </div>

                                    <ArrowRight
                                        :size="18"
                                        class="mt-1 shrink-0 text-autumn-accent opacity-80 transition-transform duration-300 group-hover:translate-x-1"
                                    />
                                </div>

                                <p class="mt-4 text-xs font-semibold uppercase tracking-[0.16em] text-autumn-accent">
                                    {{ formatArticleCount(section.count) }}
                                </p>
                            </NuxtLink>
                        </div>
                    </div>
                </div>

                <template v-else>
                    {{ docsIndex.description }}
                </template>
            </div>
        </div>

        <div class="mt-6 grid gap-4 sm:grid-cols-2">
            <NuxtLink
                v-if="previousPart"

                :to="previousPart.href"
                @mouseenter="startArrowBounce($event, -1)"
                @mouseleave="finishArrowBounce($event)"

                class="mt-3 inline-flex items-center justify-center text-autumn-accent transition-colors duration-300 hover:cursor-pointer hover:text-autumn-accent-dark group"
            >
                <span
                    data-doc-article-arrow
                    class="mr-3 inline-flex"
                >
                    <ArrowLeft :size="22" />
                </span>
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
                @mouseenter="startArrowBounce($event, 1)"
                @mouseleave="finishArrowBounce($event)"

                class="mt-3 inline-flex items-center justify-center text-autumn-accent transition-colors duration-300 hover:cursor-pointer hover:text-autumn-accent-dark group"
            >
                <div class="flex-col space-x-1 jusitfy-center">
                    {{ $t('page.documentation.next') }} 
                    <p class="text-sm font-semibold text-autumn-text transition-colors group-hover:text-autumn-accent">
                        {{ nextPart.title }}
                    </p>
                </div>
                <span
                    data-doc-article-arrow
                    class="ml-3 inline-flex"
                >
                    <ArrowRight :size="22" />
                </span>
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

    const arrowAnimationFrames = new WeakMap<HTMLElement, number>()
    const arrowOffsets = new WeakMap<HTMLElement, number>()

    const config = useRuntimeConfig()
    const { locale, t } = useI18n()

    const {
        activeDocumentPath,
        activePart,
        docsIndex,
        flatParts,
        navigation,
        nextPart,
        pageEyebrow,
        previousPart
    } = await useDocumentation()

    const siteName = `${config.public.name} Framework`

    const getArticleArrow = (event: MouseEvent): HTMLElement | null => {
        const target = event.currentTarget

        if(!(target instanceof HTMLElement))
            return null

        return target.querySelector<HTMLElement>('[data-doc-article-arrow]')
    }

    const startArrowBounce = (event: MouseEvent, direction: -1 | 1) => {
        const arrow = getArticleArrow(event)

        if(!arrow)
            return

        const existingFrame = arrowAnimationFrames.get(arrow)

        if(existingFrame)
            cancelAnimationFrame(existingFrame)

        delete arrow.dataset.transitionToken
        arrow.style.transition = ''

        const startedAt = performance.now()
        const amplitude = direction * 6
        const duration = 1100

        const tick = (time: number) => {
            const progress = ((time - startedAt) % duration) / duration
            const offset = Math.sin(progress * Math.PI) * amplitude

            arrowOffsets.set(arrow, offset)
            arrow.style.transform = `translateX(${offset}px)`

            arrowAnimationFrames.set(arrow, requestAnimationFrame(tick))
        }

        arrowAnimationFrames.set(arrow, requestAnimationFrame(tick))
    }

    const finishArrowBounce = (event: MouseEvent) => {
        const arrow = getArticleArrow(event)

        if(!arrow)
            return

        const frame = arrowAnimationFrames.get(arrow)
        const offset = arrowOffsets.get(arrow) || 0
        const transitionToken = `${Date.now()}-${Math.random()}`

        if(frame)
            cancelAnimationFrame(frame)

        arrowAnimationFrames.delete(arrow)
        arrow.dataset.transitionToken = transitionToken

        arrow.style.transition = 'none'
        arrow.style.transform = `translateX(${offset}px)`
        void arrow.offsetWidth

        arrow.style.transition = 'transform 320ms ease-out'
        arrow.style.transform = 'translateX(0)'

        arrow.addEventListener('transitionend', () => {
            if(arrow.dataset.transitionToken !== transitionToken)
                return

            arrow.style.transition = ''
            arrow.style.transform = ''
            arrowOffsets.delete(arrow)
            delete arrow.dataset.transitionToken
        }, { once : true })
    }

    const getRussianArticlePluralKey = (count: number): string => {
        const mod10 = count % 10
        const mod100 = count % 100

        if(mod10 === 1 && mod100 !== 11)
            return 'page.documentation.index_article_one'

        if(mod10 >= 2 && mod10 <= 4 && (mod100 < 12 || mod100 > 14))
            return 'page.documentation.index_article_few'

        return 'page.documentation.index_article_many'
    }

    const formatArticleCount = (count: number): string => {
        if(locale.value === 'ru')
            return t(getRussianArticlePluralKey(count), { count })

        return t(count === 1
            ? 'page.documentation.index_article_one'
            : 'page.documentation.index_article_many', { count })
    }

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
    const firstPart = computed(() => flatParts.value[0] || null)
    const indexSections = computed(() => navigation.value.map(section => {
        const parts = section.chapters.flatMap(chapter => chapter.parts.map(part => ({
            ...part,
            chapter
        })))
        const first = flatParts.value.find(part => part.article.slug === section.slug)

        return {
            slug          : section.slug,
            title         : section.title,
            href          : first?.href || firstPart.value?.href || '/documentation',
            count         : parts.length,
            chapterTitles : section.chapters.map(chapter => chapter.title).join(' · ')
        }
    }))

    const isElementNode = (node: MinimarkNode): node is [string, Record<string, unknown>, ...MinimarkNode[]] =>
        Array.isArray(node) && typeof node[0] === 'string'

    const getNodeTag = (node: MinimarkNode): string =>
        isElementNode(node) ? node[0] : ''

    const getNodeProps = (node: MinimarkNode): Record<string, unknown> =>
        isElementNode(node) ? node[1] || {} : {}

    const getNodeChildren = (node: MinimarkNode): MinimarkNode[] =>
        isElementNode(node) ? node.slice(2) as MinimarkNode[] : []

    const isNodeList = (node: MinimarkNode | MinimarkNode[]): node is MinimarkNode[] =>
        Array.isArray(node) && typeof node[0] !== 'string'

    const readMinimarkText = (node: MinimarkNode | MinimarkNode[]): string => {
        if(isNodeList(node))
            return node.map(readMinimarkText).join('')

        if(typeof node === 'string')
            return node

        return getNodeChildren(node as MinimarkNode).map(readMinimarkText).join('')
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
                    pendingName = match[1] || ''
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

    const documentationSeoPath = computed(() => activePart.value
        ? `/documentation/${activePart.value.segments.join('/')}/`
        : '/documentation/')

    const documentationBreadcrumbs = computed(() => {
        const breadcrumbs = [
            {
                name : siteName,
                path : '/'
            },
            {
                name : t('seo.documentation.title'),
                path : '/documentation/'
            }
        ]

        if(!activePart.value)
            return breadcrumbs

        const part = activePart.value
        const sectionFirstPart = flatParts.value.find(candidate => candidate.article.slug === part.article.slug)
        const chapterFirstPart = flatParts.value.find(candidate =>
            candidate.article.slug === part.article.slug
            && candidate.chapter.slug === part.chapter.slug)

        breadcrumbs.push(
            {
                name : part.article.title,
                path : sectionFirstPart
                    ? `/documentation/${sectionFirstPart.segments.join('/')}/`
                    : documentationSeoPath.value
            },
            {
                name : part.chapter.title,
                path : chapterFirstPart
                    ? `/documentation/${chapterFirstPart.segments.join('/')}/`
                    : documentationSeoPath.value
            },
            {
                name : activeTitle.value,
                path : documentationSeoPath.value
            }
        )

        return breadcrumbs
    })

    useAutumnSeo(() => ({
        title : activePart.value
            ? `${activeTitle.value} · ${t('seo.documentation.title')}`
            : t('seo.documentation.title'),
        description : activeDescription.value,
        path        : documentationSeoPath.value,
        ogType      : activePart.value ? 'article' : 'website',
        article     : Boolean(activePart.value),
        breadcrumbs : documentationBreadcrumbs.value
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
        width: 100%;
        border-collapse: separate;
        border-spacing: 0;
        border: 1px solid var(--color-autumn-border);
        border-radius: 1rem;
        background: rgba(42, 35, 32, 0.5);
        overflow: hidden;
    }

    .documentation-body :deep(th),
    .documentation-body :deep(td) {
        border-bottom: 1px solid var(--color-autumn-border);
        padding: 0.85rem 1rem;
        text-align: left;
        vertical-align: top;
    }

    .documentation-body :deep(tr:last-child td) {
        border-bottom: 0;
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
