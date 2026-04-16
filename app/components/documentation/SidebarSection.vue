<template>
    <div>
        <button
            class="group flex w-full items-center justify-between text-left transition-colors duration-200 hover:cursor-pointer"
            :class="level === 'chapter' ? 'py-1.5' : 'py-2'"
            @click="$emit('toggle')"
        >
            <div
                class="flex min-w-0 items-center"
                :class="level === 'chapter' ? 'gap-2 pl-6.5' : 'gap-2.5'"
            >
                <component
                    :is="icon"
                    v-if="icon"
                    class="h-4 w-4 shrink-0 transition-colors duration-200"
                    :class="active || expanded
                        ? 'text-autumn-accent'
                        : 'text-autumn-text-muted group-hover:text-autumn-text-secondary'"
                />

                <span
                    class="truncate transition-colors duration-200"
                    :class="level === 'chapter'
                        ? active || expanded
                            ? 'text-[11px] font-medium uppercase tracking-[0.12em] text-autumn-text'
                            : 'text-[11px] font-medium uppercase tracking-[0.12em] text-autumn-text-muted group-hover:text-autumn-text-secondary'
                        : active || expanded
                            ? 'text-[13px] font-medium uppercase tracking-wide text-autumn-text'
                            : 'text-[13px] font-medium uppercase tracking-wide text-autumn-text-secondary group-hover:text-autumn-text'"
                >
                    {{ title }}
                </span>
            </div>

            <motion.div
                :animate="{ rotate: expanded ? 90 : 0 }"
                :transition="{ duration: 0.15, ease: 'easeOut' }"
            >
                <ChevronRight
                    class="h-3.5 w-3.5 shrink-0 transition-colors duration-200"
                    :class="active || expanded
                        ? 'text-autumn-text-secondary'
                        : 'text-autumn-text-muted group-hover:text-autumn-text-secondary'"
                />
            </motion.div>
        </button>

        <AnimatePresence :initial="false">
            <motion.div
                v-if="expanded"

                key="content"
                class="overflow-hidden"

                :initial="{ height: 0, opacity: 0 }"
                :animate="{ height: 'auto', opacity: 1 }"
                :exit="{ height: 0, opacity: 0 }"
                :transition="{ duration: 0.2, ease: 'easeInOut' }"
            >
                <div :class="level === 'chapter' ? 'pt-1 pb-1' : 'pt-1 pb-2'">
                    <slot></slot>
                </div>
            </motion.div>
        </AnimatePresence>
    </div>
</template>

<script setup lang="ts">
    import type { Component }          from 'vue'
    import { ChevronRight }            from 'lucide-vue-next'
    import { AnimatePresence, motion } from 'motion-v'

    withDefaults(defineProps<{
        title: string
        expanded: boolean
        level?: 'article' | 'chapter'
        active?: boolean
        icon?: Component
    }>(), {
        level  : 'article',
        active : false
    })

    defineEmits<{
        toggle: []
    }>()
</script>
