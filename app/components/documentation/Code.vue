<template>
    <div class="w-full rounded-lg overflow-hidden border border-autumn-border bg-[#15110e]/50 backdrop-blur-xs shadow-lg">
        <div
            class="relative flex border-b border-autumn-border bg-autumn-bg-card/40 overflow-x-auto overflow-y-hidden"
        >
            <button
                v-for="(tab, i) in tabs"
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
            <div v-html="sanitizedHighlighted"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { motion }     from 'motion-v'
    import { codeToHast } from 'shiki'

    interface Tab {
        name: string
        code: string
        lang: string
    }

    const props = defineProps<{
        tabs: Tab[]
    }>()

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
    watch(
        () => [activeTab.value, props.tabs],
        async () => {
            const tab = props.tabs[activeTab.value]

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
        },
        { immediate : true }
    )
</script>
