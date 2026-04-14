<template>
    <a
        :href="github"
        target="_blank"

        class="text-autumn-text-muted hover:text-autumn-text transition-colors hover:cursor-pointer duration-200"
    >
        <Github class="w-5 h-5" />
    </a>
</template>

<script setup lang="ts">
    import { Github } from 'lucide-vue-next'

    const config = useRuntimeConfig()

    const github = config.public.github
</script>