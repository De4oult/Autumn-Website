<template>
    <a
        :href="github"
        target="_blank"

        class="text-autumn-text-secondary hover:text-autumn-text transition-colors hover:cursor-pointer duration-200"
    >
        <Github :size=20 />
    </a>
</template>

<script setup lang="ts">
    import { Github } from 'lucide-vue-next'

    const config = useRuntimeConfig()

    const github = config.public.github
</script>