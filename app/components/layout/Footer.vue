<template>
    <footer class="border-t border-autumn-border bg-autumn-bg py-8 mt-auto">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 flex flex-col md:flex-row justify-between items-center gap-4">
            <div class="flex items-center gap-2">
                <Leaf class="w-5 h-5 text-autumn-accent" />
                <span class="font-semibold text-autumn-text">
                    {{ name }} Framework
                </span>
            </div>

            <div class="text-sm text-autumn-text-muted">
                {{ $t('component.footer.built_by') }}
                <a 
                    :href="authorGithub" 
                    target="_blank"
                
                    class="text-autumn-accent hover:text-autumn-accent-dark hover:cursor-pointer duration-300"
                >
                    {{ author }}
                </a> 
                • {{ license }}
            </div>

            <div class="flex items-center gap-4">
                <ButtonGithub />
            </div>
        </div>
    </footer>
</template>

<script setup lang="ts">
    import { Leaf } from 'lucide-vue-next'

    const config = useRuntimeConfig()

    const name = config.public.name
    const license = config.public.license
    const author = config.public.author
    const authorGithub = config.public.authorGithub
</script>