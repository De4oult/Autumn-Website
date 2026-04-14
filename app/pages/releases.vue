<template>
    <div class="w-full max-w-4xl mx-auto px-4 pt-28 pb-20">
        <div class="max-w-3xl mb-10">
            <p class="mb-3 text-sm font-medium uppercase tracking-[0.2em] text-autumn-accent">
                {{ $t('page.releases.title') }}
            </p>
            <h1 class="mb-4 text-4xl font-bold sm:text-5xl">
                {{ releasesPage.title }}
            </h1>
            <p class="text-lg leading-8 text-autumn-text-secondary">
                {{ releasesPage.description }}
            </p>
        </div>

        <div class="space-y-12">
            <article
                v-for="release in releasesPage.releases"
                :key="release.version"
                class="flex flex-col gap-6 md:flex-row md:gap-12"
            >
                <div class="md:w-1/4 md:shrink-0">
                    <div class="md:sticky md:top-24">
                        <div class="mb-1 flex items-center gap-2 text-xl font-bold text-autumn-accent">
                            <TagIcon class="h-5 w-5" />
                            {{ release.version }}
                        </div>

                        <div class="text-sm text-autumn-text-muted">
                            {{ release.date }}
                        </div>
                    </div>
                </div>

                <div class="md:w-3/4 rounded-xl border border-autumn-border bg-autumn-bg-card/70 p-6">
                    <h2 class="mb-4 text-lg font-semibold text-autumn-text">
                        {{ $t('page.releases.changes') }}
                    </h2>

                    <ul class="space-y-3">
                        <li
                            v-for="change in release.changes"
                            :key="stringifyChange(change)"
                            class="flex items-start text-autumn-text-secondary"
                        >
                            <span class="mr-3 mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-autumn-accent"></span>
                            <span>
                                <template
                                    v-for="(part, index) in formatChange(change)"
                                    :key="`${stringifyChange(change)}-${index}`"
                                >
                                    <code
                                        v-if="part.type === 'code'"
                                        class="rounded bg-autumn-bg px-1 py-0.5 text-sm text-autumn-accent-dark"
                                    >
                                        {{ part.value }}
                                    </code>

                                    <strong
                                        v-else-if="part.type === 'breaking'"
                                        class="text-red-400"
                                    >
                                        {{ part.value }}
                                    </strong>

                                    <span v-else>
                                        {{ part.value }}
                                    </span>
                                </template>
                            </span>
                        </li>
                    </ul>
                </div>
            </article>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { TagIcon } from 'lucide-vue-next'

    type ReleaseRecord = {
        version: string
        date: string
        changes: unknown[]
    }

    type ReleasesContent = {
        title: string
        description: string
        meta?: {
            releases?: ReleaseRecord[]
        }
    }

    const config = useRuntimeConfig()
    const { locale, t } = useI18n()
    const siteName = `${config.public.name} Framework`

    const { data } = await useAsyncData<ReleasesContent | null>(
        `releases-${locale.value}`,
        () => queryCollection('content')
            .path(`/${locale.value}/releases`)
            .first() as Promise<ReleasesContent | null>
    )

    useHead(() => ({
        title : t('seo.releases.title'),
        meta  : [
            { name : 'description', content : t('seo.releases.description') },
            { property : 'og:title', content : `${t('seo.releases.title')} · ${siteName}` },
            { property : 'og:description', content : t('seo.releases.description') },
            { name : 'twitter:title', content : `${t('seo.releases.title')} · ${siteName}` },
            { name : 'twitter:description', content : t('seo.releases.description') }
        ]
    }))

    const releasesPage = computed(() => ({
        title       : data.value?.title || 'Releases',
        description : data.value?.description || 'Changelog and release history for the Autumn framework.',
        releases    : data.value?.meta?.releases || []
    }))

    const stringifyChange = (value: unknown): string => {
        if(typeof value === 'string')
            return value

        if(value && typeof value === 'object') {
            const record = Object.entries(value as Record<string, unknown>)[0]

            if(record) 
                return `${record[0]}: ${String(record[1])}`
        }

        return String(value ?? '')
    }

    type ChangePart = {
        type: 'text' | 'code' | 'breaking'
        value: string
    }

    const formatChange = (change: unknown): ChangePart[] => {
        const source = stringifyChange(change)
        const pattern = /(@[a-zA-Z.]+|Breaking:)/g
        const parts: ChangePart[] = []

        let lastIndex = 0

        for(const match of source.matchAll(pattern)) {
            const index = match.index ?? 0

            if(index > lastIndex) {
                parts.push({
                    type  : 'text',
                    value : source.slice(lastIndex, index)
                })
            }

            parts.push({
                type  : match[0] === 'Breaking:' ? 'breaking' : 'code',
                value : match[0]
            })

            lastIndex = index + match[0].length
        }

        if(lastIndex < source.length) {
            parts.push({
                type  : 'text',
                value : source.slice(lastIndex)
            })
        }

        return parts
    }
</script>
