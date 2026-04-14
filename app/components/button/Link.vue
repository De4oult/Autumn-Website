<template>
    <a
        :href="href"
        target="_blank"
        
        class="px-8 py-3 rounded-md border border-autumn-border hover:bg-autumn-bg-hover transition hover:cursor-pointer duration-300"
    >
        <slot></slot>
    </a>
</template>

<script setup lang="ts">
    defineProps<{
        href : string
    }>()
</script>