<template>
    <div class="w-full rounded-lg overflow-hidden border border-autumn-border bg-[#15110e]/50 backdrop-blur-xs shadow-lg">
        <div
            class="relative flex border-b border-autumn-border bg-autumn-bg-card/40 overflow-x-auto overflow-y-hidden"
        >
            <button
                v-for="(tab, i) in normalizedTabs"
                :key="tab.name"
                ref="tabsRefs"

                class="px-3 sm:px-4 py-2 text-xs sm:text-sm font-medium whitespace-nowrap transition-colors duration-300"

                :class="i === activeTab
                    ? 'text-autumn-accent'
                    : 'text-autumn-text-secondary hover:text-autumn-text hover:bg-autumn-bg-hover/50 cursor-pointer'"

                @click="activeTab = i"
            >
                {{ tab.name }}
            </button>

            <motion.div
                class="absolute bottom-0 h-0.5 bg-autumn-accent rounded-full"

                :animate="indicatorStyle"

                :transition="{
                    type: 'spring',
                    stiffness: 500,
                    damping: 35,
                    mass: 0.5
                }"
            />
        </div>

        <div class="p-3 sm:p-4 overflow-x-auto text-xs sm:text-sm">
            <div
                v-if="sanitizedHighlighted"
                v-html="sanitizedHighlighted"
            ></div>

            <pre
                v-else
                class="overflow-x-auto whitespace-pre-wrap break-words rounded-md bg-transparent text-autumn-text"
            ><code>{{ activeCode }}</code></pre>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { motion }     from 'motion-v'
    import { codeToHast } from 'shiki'

    type Tab = {
        name: string
        code: string
        lang: string
    }

    type LooseTab = Partial<Tab> & {
        title?: string
        label?: string
        filename?: string
        language?: string
        content?: string
        value?: string
    }

    const props = withDefaults(defineProps<{
        tabs?: Tab[] | LooseTab[] | string
    }>(), {
        tabs : () => []
    })
    const attrs = useAttrs()
    const slots = useSlots()

    type HastNode = {
        type?: string
        tagName?: string
        value?: string
        properties?: Record<string, unknown>
        children?: HastNode[]
    }

    const activeTab = ref(0)
    const highlighted = ref<HastNode | null>(null)
    const sanitizedHighlighted = computed(() => sanitizeHastHtml(highlighted.value))

    const tabsRefs = ref<HTMLElement[]>([])

    const getNodeName = (node: any): string => {
        const type = node?.type

        if(typeof type === 'string')
            return type

        return type?.__name || type?.name || type?.__asyncResolved?.__name || type?.__asyncResolved?.name || ''
    }

    const getNodeChildren = (node: any): any[] => {
        if(Array.isArray(node))
            return node

        if(!node)
            return []

        if(typeof node.children === 'string')
            return [node.children]

        if(Array.isArray(node.children))
            return node.children

        if(typeof node.children?.default === 'function')
            return node.children.default()

        return []
    }

    const readNodeText = (node: any): string => {
        if(typeof node === 'string')
            return node

        if(Array.isArray(node))
            return node.map(readNodeText).join('')

        return getNodeChildren(node).map(readNodeText).join('')
    }

    const slotText = computed(() =>
        readNodeText(slots.default?.() || []).trim()
    )

    const rawTabs = computed(() => {
        const attrTabs = attrs.tabs ?? attrs[':tabs'] ?? attrs['v-bind:tabs']

        if(props.tabs?.length)
            return props.tabs

        if(typeof attrTabs !== 'undefined')
            return attrTabs

        return null
    })

    const parseTabs = (value: typeof props.tabs | unknown): unknown[] => {
        if(Array.isArray(value))
            return value

        if(typeof value !== 'string' || !value.trim())
            return []

        try {
            const parsed = JSON.parse(value) as unknown

            if(Array.isArray(parsed))
                return parsed

            return parsed && typeof parsed === 'object' ? [parsed] : []
        }
        catch {
            try {
                const wrapped = JSON.parse(`[${value.replace(/,\s*$/, '')}]`) as unknown

                if(Array.isArray(wrapped))
                    return wrapped
            }
            catch {
                return []
            }

            return []
        }
    }

    const normalizeLooseTabs = (tabs: unknown[]): Tab[] =>
        tabs
            .map((tab, index) => {
                if(typeof tab === 'string') {
                    return {
                        name : `Tab ${index + 1}`,
                        code : tab,
                        lang : 'text'
                    }
                }

                if(!tab || typeof tab !== 'object')
                    return null

                const value = tab as LooseTab
                const code = value.code || value.content || value.value || ''
                const lang = value.lang || value.language || 'text'
                const name = value.name || value.title || value.label || value.filename || `Tab ${index + 1}`

                if(!code)
                    return null

                return {
                    name,
                    code,
                    lang
                }
            })
            .filter((tab): tab is Tab => !!tab)

    const parseMarkerTabs = (value: string): Tab[] => {
        const matches = value.matchAll(/@tab\s+(.+?)\s+\[([^\]]+)\]([\s\S]*?)(?=@tab\s+|$)/g)

        return Array.from(matches)
            .map(match => {
                const name = match[1]?.trim()
                const lang = match[2]?.trim() || 'text'
                const code = match[3]?.trim()

                if(!name || !code)
                    return null

                return {
                    name,
                    lang,
                    code
                }
            })
            .filter((tab): tab is Tab => !!tab)
    }

    const slotTabs = computed<Tab[]>(() => {
        const nodes = slots.default?.() || []
        const items: Array<
            | { kind: 'heading'; title: string }
            | { kind: 'paragraph'; text: string }
            | { kind: 'code'; code: string; lang: string; name?: string }
        > = []

        const visitNode = (node: any): void => {
            if(Array.isArray(node)) {
                node.forEach(visitNode)
                return
            }

            if(!node)
                return

            if(typeof node === 'string')
                return

            const name = getNodeName(node)
            const children = getNodeChildren(node)
            const text = readNodeText(children).trim()
            const code = typeof node.props?.code === 'string' ? node.props.code : ''
            const lang = typeof node.props?.language === 'string'
                ? node.props.language
                : typeof node.props?.lang === 'string'
                    ? node.props.lang
                    : 'text'

            if(code) {
                items.push({
                    kind : 'code',
                    code,
                    lang,
                    name : typeof node.props?.filename === 'string' ? node.props.filename : undefined
                })
                return
            }

            if(/^h[1-6]$/i.test(name) || /^ProseH[1-6]$/i.test(name)) {
                if(text)
                    items.push({ kind : 'heading', title : text })

                return
            }

            if(name === 'p' || name === 'ProseP') {
                if(text)
                    items.push({ kind : 'paragraph', text })

                return
            }

            visitNode(children)
        }

        visitNode(nodes)

        const result: Tab[] = []
        let pendingName = ''
        let pendingLang = ''

        for(const item of items) {
            if(item.kind === 'heading') {
                pendingName = item.title
                continue
            }

            if(item.kind === 'paragraph') {
                const match = item.text.match(/^@tab\s+(.+?)(?:\s+([a-z0-9_-]+))?$/i)

                if(match) {
                    pendingName = match[1]
                    pendingLang = match[2] || ''
                }

                continue
            }

            result.push({
                name : pendingName || item.name || `Tab ${result.length + 1}`,
                lang : pendingLang || item.lang,
                code : item.code
            })

            pendingName = ''
            pendingLang = ''
        }

        const markerTabs = parseMarkerTabs(slotText.value)

        if(markerTabs.length)
            return markerTabs

        if(result.length)
            return result

        return normalizeLooseTabs(parseTabs(slotText.value))
    })

    const normalizedTabs = computed<Tab[]>(() => {
        const propTabs = normalizeLooseTabs(parseTabs(rawTabs.value))

        return propTabs.length ? propTabs : slotTabs.value
    })
    const activeCode = computed(() => normalizedTabs.value[activeTab.value]?.code || '')

    const allowedTags = new Set(['pre', 'code', 'span'])

    const escapeHtml = (value: string): string => value
        .replaceAll('&', '&amp;')
        .replaceAll('<', '&lt;')
        .replaceAll('>', '&gt;')
        .replaceAll('"', '&quot;')
        .replaceAll("'", '&#39;')

    const escapeAttribute = (value: string): string => escapeHtml(value)

    const stringifyClass = (value: unknown): string => {
        if(Array.isArray(value))
            return value.map(item => String(item)).join(' ')

        return typeof value === 'string' ? value : ''
    }

    const sanitizeStyle = (value: unknown): string => {
        const raw = Array.isArray(value) ? value.join(';') : String(value || '')
        const safeDeclarations = raw
            .split(';')
            .map(part => part.trim())
            .filter(Boolean)
            .filter(part => /^(color|background-color|background|font-style|font-weight|text-decoration|text-decoration-line):/i.test(part))

        return safeDeclarations.join('; ')
    }

    const renderHastNode = (node: HastNode): string => {
        if(node.type === 'text')
            return escapeHtml(String(node.value || ''))

        if(node.type !== 'element')
            return ''

        const tagName = String(node.tagName || '')

        if(!allowedTags.has(tagName))
            return (node.children || []).map(renderHastNode).join('')

        const attributes: string[] = []
        const className = stringifyClass(node.properties?.className ?? node.properties?.class)

        if(className)
            attributes.push(`class="${escapeAttribute(className)}"`)

        const style = sanitizeStyle(node.properties?.style)

        if(style)
            attributes.push(`style="${escapeAttribute(style)}"`)

        const tabIndex = node.properties?.tabindex

        if(typeof tabIndex === 'number' || typeof tabIndex === 'string')
            attributes.push(`tabindex="${escapeAttribute(String(tabIndex))}"`)

        const children = (node.children || []).map(renderHastNode).join('')
        const attrs = attributes.length ? ` ${attributes.join(' ')}` : ''

        return `<${tagName}${attrs}>${children}</${tagName}>`
    }

    const sanitizeHastHtml = (tree: HastNode | null): string => {
        if(!tree)
            return ''

        if(tree.type === 'root')
            return (tree.children || []).map(renderHastNode).join('')

        return renderHastNode(tree)
    }

    const indicatorStyle = computed(() => {
        const element = tabsRefs.value[activeTab.value]

        if(!element) 
            return { opacity : 0 }

        return {
            width : element.offsetWidth,
            x     : element.offsetLeft
        }
    })

    const renderActiveTab = async (): Promise<void> => {
        const tab = normalizedTabs.value[activeTab.value]

        if(!tab) {
            highlighted.value = null
            return
        }

        highlighted.value = await codeToHast(tab.code, {
            lang         : tab.lang,
            theme        : 'github-dark',
            transformers : [
                {
                    pre(node) {
                        node.properties.style = 'background: transparent;'
                    }
                }
            ]
        })
    }

    await renderActiveTab()

    watch(
        () => [activeTab.value, normalizedTabs.value],
        async () => {
            await renderActiveTab()
        }
    )

    watch(
        normalizedTabs,
        tabs => {
            if(!tabs.length) {
                activeTab.value = 0
                return
            }

            if(activeTab.value > tabs.length - 1)
                activeTab.value = 0
        },
        {
            immediate : true
        }
    )
</script>
