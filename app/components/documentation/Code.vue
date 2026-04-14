<template>
    <div class="rounded-lg overflow-hidden border border-autumn-border bg-[#15110e]/50 backdrop-blur-xs shadow-lg">
        <div
            class="relative flex border-b border-autumn-border bg-autumn-bg-card/40 overflow-x-auto overflow-y-hidden"
        >
            <button
                v-for="(tab, i) in tabs"
                :key="tab.name"
                ref="tabsRefs"

                class="px-4 py-2 text-sm font-medium whitespace-nowrap transition-colors duration-300"

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

        <div class="p-4 overflow-x-auto text-sm">
            <div v-html="highlighted"></div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { motion }     from 'motion-v'
    import { codeToHtml } from 'shiki'

    interface Tab {
        name: string
        code: string
        lang: string
    }

    const props = defineProps<{
        tabs: Tab[]
    }>()

    const activeTab = ref(0)
    const highlighted = ref('')

    const tabsRefs = ref<HTMLElement[]>([])

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
                highlighted.value = ''
                return
            }

            highlighted.value = await codeToHtml(tab.code, {
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