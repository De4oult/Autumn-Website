<template>
    <NuxtLink
        :to="to"
        class="relative block rounded-md pr-2 pl-3 text-left text-[13px] transition-all duration-150"
        :class="isActive
            ? 'bg-autumn-accent/8 font-medium text-autumn-accent'
            : 'text-autumn-text-secondary hover:bg-autumn-bg-hover/50 hover:text-autumn-text'"
    >
        <motion.span
            v-if="isActive"

            layout-id="documentation-sidebar-active-indicator"

            class="absolute left-0 h-full w-1 rounded-l-full bg-autumn-accent"
            
            :transition="{
                type      : 'spring',
                stiffness : 350,
                damping   : 30
            }"
        />

        <span class="relative py-1.5 block truncate">
            <slot></slot>
        </span>
    </NuxtLink>
</template>

<script setup lang="ts">
    import { motion } from 'motion-v'

    withDefaults(defineProps<{
        to: string
        isActive?: boolean
    }>(), {
        isActive : false
    })
</script>
