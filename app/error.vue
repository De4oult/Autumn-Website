<template>
    <div class="relative min-h-screen overflow-hidden bg-autumn-bg text-autumn-text font-sans selection:bg-autumn-accent/30 selection:text-autumn-text">
        <div
            class="pointer-events-none absolute inset-0 opacity-90"
            style="background: radial-gradient(circle at top left, rgba(243, 156, 18, 0.16), transparent 32%), radial-gradient(circle at bottom right, rgba(230, 126, 34, 0.12), transparent 28%);"
            
            aria-hidden="true"
        ></div>

        <LayoutFallenLeaves intensity="subtle" />

        <main class="relative z-10 flex min-h-screen items-center px-4 py-16 sm:px-6">
            <div class="mx-auto grid w-full max-w-6xl gap-6 lg:grid-cols-[minmax(0,1.15fr)_minmax(320px,0.85fr)] lg:items-center">
                <section class="rounded-4xl border border-autumn-border bg-autumn-bg-card/45 p-8 shadow-[0_30px_120px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:p-10">
                    <p class="mb-5 inline-flex items-center rounded-full border border-autumn-accent/20 bg-autumn-accent/10 px-4 py-2 text-xs font-semibold uppercase tracking-[0.26em] text-autumn-accent">
                        {{ $t('page.error.eyebrow') }}
                    </p>

                    <div class="mb-6 flex items-center gap-3 text-autumn-accent">
                        <Leaf class="h-8 w-8" />
                        <span class="text-sm uppercase tracking-[0.3em] text-autumn-text-secondary">
                            {{ name }} Framework
                        </span>
                    </div>

                    <h1 class="max-w-2xl text-4xl font-bold leading-tight sm:text-5xl lg:text-6xl">
                        {{ title }}
                    </h1>

                    <p class="mt-5 max-w-2xl text-lg leading-8 text-autumn-text-secondary">
                        {{ subtitle }}
                    </p>

                    <div class="mt-8 flex flex-col gap-3 sm:flex-row sm:flex-wrap">
                        <ButtonPrimary
                            size="lg"
                            @click="goHome"
                        >
                            <ArrowLeft :size="16" class="mr-2" />
                            {{ $t('page.error.home') }}
                        </ButtonPrimary>

                        <ButtonLink :href="github">
                            <Github :size="16" class="mr-2" />
                            {{ $t('page.error.github') }}
                        </ButtonLink>
                    </div>
                </section>

                <aside class="rounded-4xl border border-autumn-border bg-autumn-bg/72 p-7 shadow-[0_24px_100px_rgba(0,0,0,0.16)] backdrop-blur-xl sm:p-8">
                    <div class="flex items-center justify-between">
                        <div class="rounded-2xl border border-autumn-border-light bg-autumn-bg-card/70 px-4 py-3">
                            <div class="text-xs uppercase tracking-[0.28em] text-autumn-text-muted">
                                {{ $t('page.error.status_label') }}
                            </div>
                            <div class="mt-2 text-4xl font-bold text-autumn-accent">
                                {{ statusCode }}
                            </div>
                        </div>

                        <div class="rounded-full border border-autumn-accent/20 bg-autumn-accent/10 p-4 text-autumn-accent">
                            <Compass class="h-6 w-6" />
                        </div>
                    </div>

                    <div class="mt-8">
                        <h2 class="text-2xl font-semibold">
                            {{ $t('page.error.status_title') }}
                        </h2>

                        <p class="mt-4 text-base leading-7 text-autumn-text-secondary">
                            {{ $t('page.error.status_body') }}
                        </p>
                    </div>

                    <div class="mt-6 rounded-2xl border border-autumn-border bg-autumn-bg-card/55 p-5">
                        <p class="text-sm leading-7 text-autumn-text-secondary">
                            {{ $t('page.error.status_hint') }}
                        </p>
                    </div>

                    <div class="mt-8 text-sm text-autumn-text-muted">
                        {{ name }} Framework • {{ author }}
                    </div>
                </aside>
            </div>
        </main>
    </div>
</template>

<script setup lang="ts">
    import { ArrowLeft, Compass, Github, Leaf } from 'lucide-vue-next'

    type ErrorState = {
        statusCode?: number
        statusMessage?: string
        message?: string
    }

    const props = defineProps<{
        error: ErrorState
    }>()

    const config = useRuntimeConfig()
    const { t } = useI18n()
    const localePath = useLocalePath()

    const name = config.public.name
    const author = config.public.author
    const github = config.public.github

    const statusCode = computed(() => props.error?.statusCode || 500)
    const isNotFound = computed(() => statusCode.value === 404)
    
    const title = computed(() => isNotFound.value
        ? t('page.error.title')
        : (props.error?.statusMessage || t('seo.error.title')))

    const subtitle = computed(() => isNotFound.value
        ? t('page.error.subtitle')
        : (props.error?.message || t('seo.error.description')))

    const goHome = () => clearError({
        redirect : localePath('/')
    })

    useHead(() => ({
        title : `${t('seo.error.title')} · ${name} Framework`,
        meta  : [
            { name : 'robots', content : 'noindex, follow' },
            { name : 'description', content : subtitle.value }
        ]
    }))
</script>
