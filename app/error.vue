<template>
    <div class="relative min-h-screen overflow-hidden bg-autumn-bg text-autumn-text font-sans selection:bg-autumn-accent/30 selection:text-autumn-text">
        <div
            class="pointer-events-none absolute inset-0 opacity-90"
            style="background: radial-gradient(circle at top left, rgba(243, 156, 18, 0.16), transparent 32%), radial-gradient(circle at bottom right, rgba(230, 126, 34, 0.12), transparent 28%);"
            
            aria-hidden="true"
        ></div>

        <LayoutFallenLeaves intensity="subtle" />

        <main class="relative z-10 flex min-h-screen items-center justify-center px-4 py-16 sm:px-6">
            <section class="w-full max-w-2xl rounded-4xl border border-autumn-border bg-autumn-bg-card/55 px-6 py-12 text-center shadow-[0_30px_120px_rgba(0,0,0,0.22)] backdrop-blur-xl sm:px-10 sm:py-14">
                <div class="mb-6 inline-flex items-center gap-3 text-autumn-accent">
                    <Leaf class="h-7 w-7" />
                    <span class="text-sm uppercase tracking-[0.3em] text-autumn-text-secondary">
                        {{ name }} Framework
                    </span>
                </div>

                <p class="text-[clamp(5rem,16vw,9rem)] font-extrabold leading-none text-autumn-accent">
                    {{ statusCode }}
                </p>

                <h1 class="mt-4 text-3xl font-semibold sm:text-4xl">
                    {{ title }}
                </h1>

                <p class="mx-auto mt-4 max-w-xl text-base leading-7 text-autumn-text-secondary sm:text-lg">
                    {{ subtitle }}
                </p>

                <div class="mt-8 flex justify-center">
                    <ButtonPrimary
                        size="lg"
                        @click="goHome"
                    >
                        <ArrowLeft :size="16" class="mr-2" />
                        {{ $t('page.error.home') }}
                    </ButtonPrimary>
                </div>

                <p class="mt-6 text-sm text-autumn-text-muted">
                    {{ name }} Framework • {{ author }}
                </p>
            </section>
        </main>
    </div>
</template>

<script setup lang="ts">
    import { ArrowLeft, Leaf } from 'lucide-vue-next'

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
