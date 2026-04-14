<template>
    <div class="flex min-h-screen items-center justify-center px-4 pt-24 pb-16 sm:px-6">
        <section class="mx-auto max-w-2xl text-center">
            <p class="mb-3 text-sm font-medium uppercase tracking-[0.22em] text-autumn-accent">
                {{ $t('common.page_in_progress') }}
            </p>

            <h1 class="mb-4 text-4xl font-bold sm:text-5xl">
                {{ $t('page.documentation.title') }}
            </h1>

            <p class="text-lg leading-8 text-autumn-text-secondary">
                {{ $t('page.documentation.subtitle') }}       
            </p>
        </section>
    </div>
</template>

<script setup lang="ts">
    const config = useRuntimeConfig()
    const { t } = useI18n()

    const siteName = `${config.public.name} Framework`

    useHead(() => ({
        title : t('seo.documentation.title'),
        meta  : [
            { name : 'description', content : t('seo.documentation.description') },
            { property : 'og:title', content : `${t('seo.documentation.title')} · ${siteName}` },
            { property : 'og:description', content : t('seo.documentation.description') },
            { name : 'twitter:title', content : `${t('seo.documentation.title')} · ${siteName}` },
            { name : 'twitter:description', content : t('seo.documentation.description') }
        ]
    }))
</script>
