<template>
    <div class="w-full max-w-4xl mx-auto px-4 pt-28 pb-20">
        <div class="text-center mb-16">
            <h1 class="text-4xl md:text-5xl font-bold mb-4">
                {{ roadmap.title }}
            </h1>

            <p class="text-xl text-autumn-text-secondary max-w-2xl mx-auto">
                {{ roadmap.description }}
            </p>
        </div>

        <div class="relative mx-auto max-w-3xl">
            <div class="flex flex-col gap-16">
                <div
                    v-for="(phase, index) in roadmap.items"
                    :key="index"

                    class="relative pl-10 md:pl-14"
                >
                    <div
                        v-if="index !== 0"
                        class="absolute left-3 top-0 bottom-1/2 w-px -translate-x-1/2 bg-autumn-border"
                    ></div>

                    <div
                        v-if="index !== roadmap.items.length - 1"
                        class="absolute left-3 top-1/2 -bottom-16 w-px -translate-x-1/2 bg-autumn-border"
                    ></div>

                    <div class="absolute left-0 top-1/2 flex h-6 w-6 -translate-y-1/2 items-center justify-center rounded-full bg-autumn-bg">
                        <component
                            :is="getStatusIcon(phase.status)"
                            :size="18"
                        />
                    </div>

                    <div
                        class="rounded-xl border border-autumn-border bg-autumn-bg-card/40 p-6 backdrop-blur-xs transition-all"
                        :class="{
                            'border-autumn-accent/50 shadow-[0_0_15px_rgba(243,156,18,0.1)]':
                                phase.status === 'in-progress'
                        }"
                    >
                        <div class="mb-4 flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
                            <h3 class="text-xl font-bold">
                                {{ phase.title }}
                            </h3>

                            <span
                                class="w-fit text-sm px-3 py-1 rounded-full border"
                                :class="getStatusBadge(phase.status)"
                            >
                                {{ phase.version }}
                            </span>
                        </div>

                        <ul class="space-y-3">
                            <li
                                v-for="(item, i) in phase.items"
                                :key="i"

                                class="flex items-start text-autumn-text-secondary"
                            >
                                <span class="mr-2 mt-1.5 h-1.5 w-1.5 shrink-0 rounded-full bg-autumn-border-light"></span>
                                <span>{{ item }}</span>
                            </li>
                        </ul>
                    </div>
                </div>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import {
        CheckCircle2,
        CircleDashed,
        Circle
    } from 'lucide-vue-next'    

    type RoadmapStatus = 'completed' | 'in-progress' | 'planned'
    type RoadmapPhase = {
        status: RoadmapStatus
        version: string
        title: string
        items: string[]
    }
    type RoadmapContent = {
        title: string
        description: string
        meta?: {
            items?: RoadmapPhase[]
        }
    }

    const config = useRuntimeConfig()
    const { locale, t } = useI18n()
    const siteName = `${config.public.name} Framework`

    const { data } = await useAsyncData<RoadmapContent | null>(
        `roadmap-${locale.value}`,
        () => queryCollection('content')
            .path(`/${locale.value}/roadmap`)
            .first() as Promise<RoadmapContent | null>
    )

    useHead(() => ({
        title : t('seo.roadmap.title'),
        meta  : [
            { name : 'description', content : t('seo.roadmap.description') },
            { property : 'og:title', content : `${t('seo.roadmap.title')} · ${siteName}` },
            { property : 'og:description', content : t('seo.roadmap.description') },
            { name : 'twitter:title', content : `${t('seo.roadmap.title')} · ${siteName}` },
            { name : 'twitter:description', content : t('seo.roadmap.description') }
        ]
    }))

    const roadmap = computed(() => ({
        title       : data.value?.title || 'Roadmap',
        description : data.value?.description || 'Where we are and where we are going.',
        items       : data.value?.meta?.items || []
    }))

    const getStatusIcon = (status: RoadmapStatus) => {
        switch(status) {
            case 'completed':
                return CheckCircle2

            case 'in-progress':
                return {
                    render() {
                        return h(CircleDashed, {
                            class : 'text-autumn-accent animate-spin',
                            style : 'animation-duration: 3s'
                        })
                    }
                }

            case 'planned':
                return Circle
        }
    }

    const getStatusBadge = (status: RoadmapStatus) => {
        switch(status) {
            case 'completed':
                return 'text-autumn-text-secondary border-autumn-border'

            case 'in-progress':
                return 'text-autumn-accent border-autumn-accent/30 bg-autumn-accent/10'

            case 'planned':
                return 'text-autumn-text-muted border-autumn-border'
        }
    }
</script>
