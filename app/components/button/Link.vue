<template>
    <a
        :href="href"
        target="_blank"
        
        class="inline-flex items-center justify-center px-8 py-3 rounded-md border border-autumn-border text-center hover:bg-autumn-bg-hover transition hover:cursor-pointer duration-300"
    >
        <slot></slot>
    </a>
</template>

<script setup lang="ts">
    defineProps<{
        href : string
    }>()
</script>
