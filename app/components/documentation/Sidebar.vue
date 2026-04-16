<template>
    <div class="md:w-65 md:shrink-0">
        <div class="mb-6 md:hidden">
            <button
                class="flex w-full items-center justify-between rounded-2xl border border-autumn-border bg-autumn-bg-card/60 px-4 py-3 text-left shadow-[0_20px_60px_rgba(0,0,0,0.18)] backdrop-blur-xl transition-colors duration-200 hover:border-autumn-accent/40 hover:cursor-pointer"
                type="button"
                @click="openMobileSidebar"
            >
                <div class="min-w-0">
                    <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-autumn-accent/90">
                        {{ $t('page.documentation.navigation') }}
                    </p>

                    <p class="mt-1 truncate text-sm font-medium text-autumn-text">
                        {{ activePart?.title || docsIndex.title }}
                    </p>
                </div>

                <Menu class="h-4 w-4 shrink-0 text-autumn-text-secondary" />
            </button>
        </div>

        <AnimatePresence :initial="false">
            <motion.div
                v-if="isMobileOpen"
                class="fixed inset-x-0 top-16 bottom-0 z-40 bg-black/55 md:hidden"
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
                :transition="{ duration: 0.18, ease: 'easeOut' }"
                @click="closeMobileSidebar"
            />
        </AnimatePresence>

        <aside
            class="fixed top-16 left-0 z-40 flex h-[calc(100dvh-4rem)] w-[min(88vw,20rem)] flex-col border-r border-autumn-border/60 bg-autumn-bg-card/95 shadow-[0_30px_80px_rgba(0,0,0,0.32)] backdrop-blur-xl transition-transform duration-200 ease-out md:sticky md:top-20 md:z-auto md:h-[calc(100vh-5rem)] md:w-65 md:self-start md:border-autumn-border/40 md:bg-transparent md:shadow-none md:translate-x-0"
            :class="[
                isMobileOpen ? 'translate-x-0' : '-translate-x-full md:translate-x-0',
                isMobileOpen ? 'pointer-events-auto' : 'pointer-events-none md:pointer-events-auto'
            ]"
        >
            <div class="border-b border-autumn-border/50 px-5 py-4 md:hidden">
                <div class="flex items-center justify-between gap-3">
                    <div class="min-w-0">
                        <p class="text-[11px] font-medium uppercase tracking-[0.16em] text-autumn-accent/90">
                            {{ $t('page.documentation.navigation') }}
                        </p>

                        <p class="mt-1 truncate text-sm font-medium text-autumn-text">
                            {{ docsIndex.title }}
                        </p>
                    </div>

                    <button
                        class="rounded-xl border border-autumn-border/70 p-2 text-autumn-text-secondary transition-colors duration-200 hover:border-autumn-accent/40 hover:text-autumn-text hover:cursor-pointer"
                        type="button"
                        @click="closeMobileSidebar"
                    >
                        <X class="h-4 w-4" />
                    </button>
                </div>
            </div>

            <div class="hidden px-5 pt-6 pb-4 md:block">
                <p class="text-[11px] font-medium uppercase tracking-[0.18em] text-autumn-accent/90">
                    {{ pageEyebrow }}
                </p>
            </div>

            <div class="border-b border-autumn-border/50 px-5 py-4 md:border-b-0 md:pt-0 md:pb-4">
                <div class="relative">
                    <Search class="pointer-events-none absolute top-1/2 left-2.5 h-3.5 w-3.5 -translate-y-1/2 text-autumn-text-muted" />

                    <input
                        v-model="searchQuery"
                        type="text"
                        :placeholder="$t('page.documentation.search')"
                        class="w-full rounded-lg border border-autumn-border/60 bg-transparent py-2 pr-3 pl-8 text-sm text-autumn-text placeholder:text-autumn-text-muted transition-all focus:border-autumn-accent/50 focus:ring-1 focus:ring-autumn-accent/20 focus:outline-none md:py-1.5"
                    >
                </div>
            </div>

            <div
                ref="scrollContainer"
                class="no-scrollbar sidebar-scroll flex-1 overflow-y-auto px-5 pb-6"
                @scroll="handleScroll"
            >
                <nav class="space-y-1">
                    <template
                        v-for="(section, index) in filteredNavigation"
                        :key="section.slug"
                    >
                        <div
                            v-if="index > 0"
                            class="my-3 h-px bg-autumn-border/30"
                        ></div>

                        <DocumentationSidebarSection
                            :active="activePart?.article.slug === section.slug"
                            :expanded="isSectionExpanded(section.slug)"
                            :icon="getSectionIcon(section.slug)"
                            :title="section.title"
                            @toggle="toggleSection(section.slug)"
                        >
                            <DocumentationSidebarSection
                                v-for="chapter in section.chapters"
                                :key="`${section.slug}-${chapter.slug}`"
                                :active="activePart?.article.slug === section.slug && activePart?.chapter.slug === chapter.slug"
                                :expanded="isChapterExpanded(section.slug, chapter.slug)"
                                level="chapter"
                                :title="chapter.title"
                                @toggle="toggleChapter(section.slug, chapter.slug)"
                            >
                                <div class="space-y-0.5 pl-[38px]">
                                    <DocumentationSidebarItem
                                        v-for="part in chapter.parts"
                                        :key="`${chapter.slug}-${part.slug}`"
                                        :is-active="isActivePart(section.slug, chapter.slug, part.slug)"
                                        :to="toPartPath([section.slug, chapter.slug, part.slug])"
                                        @click="closeMobileSidebar"
                                    >
                                        {{ part.title }}
                                    </DocumentationSidebarItem>
                                </div>
                            </DocumentationSidebarSection>
                        </DocumentationSidebarSection>
                    </template>

                    <p
                        v-if="!filteredNavigation.length"
                        class="rounded-lg border border-dashed border-autumn-border/50 px-3 py-3 text-sm text-autumn-text-secondary"
                    >
                        {{ $t('page.documentation.search_empty') }}
                    </p>
                </nav>
            </div>
        </aside>
    </div>
</template>

<script setup lang="ts">
    import type { Component }                                     from 'vue'
    import { BookOpen, Code2, FileText, Menu, Rocket, Search, X } from 'lucide-vue-next'
    import { AnimatePresence, motion }                            from 'motion-v'
    import type { DocumentationSection }                          from '~/composables/useDocumentation'

    const {
        activePart,
        docsIndex,
        isActivePart,
        navigation,
        pageEyebrow,
        toPartPath
    } = await useDocumentation()

    const sectionState = useState<Record<string, boolean>>(
        'documentation-sidebar-sections',
        () => ({})
    )
    const chapterState = useState<Record<string, boolean>>(
        'documentation-sidebar-chapters',
        () => ({})
    )
    const scrollState = useState<number>(
        'documentation-sidebar-scroll',
        () => 0
    )
    const searchQuery = useState<string>(
        'documentation-sidebar-search',
        () => ''
    )
    const isMobileOpen = useState<boolean>(
        'documentation-sidebar-mobile-open',
        () => false
    )

    const scrollContainer = ref<HTMLElement | null>(null)

    const chapterKey = (sectionSlug: string, chapterSlug: string): string => `${sectionSlug}:${chapterSlug}`
    const normalizedQuery = computed(() => searchQuery.value.trim().toLocaleLowerCase())
    const isSearchActive = computed(() => normalizedQuery.value.length > 0)

    const sectionIcons: Record<string, Component> = {
        'get-started' : Rocket,
        concepts      : BookOpen,
        examples      : Code2,
        reference     : FileText
    }

    const matchesQuery = (value?: string): boolean =>
        !!value && value.toLocaleLowerCase().includes(normalizedQuery.value)

    const filteredNavigation = computed<DocumentationSection[]>(() => {
        if(!isSearchActive.value)
            return navigation.value

        return navigation.value.flatMap(section => {
            if(matchesQuery(section.title))
                return [section]

            const chapters = section.chapters.flatMap(chapter => {
                if(matchesQuery(chapter.title))
                    return [chapter]

                const parts = chapter.parts.filter(part => matchesQuery(part.title))

                if(!parts.length)
                    return []

                return [{
                    ...chapter,
                    parts
                }]
            })

            if(!chapters.length)
                return []

            return [{
                ...section,
                chapters
            }]
        })
    })

    const getSectionIcon = (sectionSlug: string): Component => sectionIcons[sectionSlug] || FileText

    const isSectionExpanded = (sectionSlug: string): boolean =>
        isSearchActive.value ? true : sectionState.value[sectionSlug] ?? true

    const isChapterExpanded = (sectionSlug: string, chapterSlug: string): boolean =>
        isSearchActive.value ? true : chapterState.value[chapterKey(sectionSlug, chapterSlug)] ?? true

    const toggleSection = (sectionSlug: string): void => {
        if(isSearchActive.value)
            return

        sectionState.value = {
            ...sectionState.value,
            [sectionSlug] : !isSectionExpanded(sectionSlug)
        }
    }

    const toggleChapter = (sectionSlug: string, chapterSlug: string): void => {
        if(isSearchActive.value)
            return

        const key = chapterKey(sectionSlug, chapterSlug)

        chapterState.value = {
            ...chapterState.value,
            [key] : !isChapterExpanded(sectionSlug, chapterSlug)
        }
    }

    const openMobileSidebar = (): void => {
        isMobileOpen.value = true
    }

    const closeMobileSidebar = (): void => {
        isMobileOpen.value = false
    }

    const handleScroll = (): void => {
        scrollState.value = scrollContainer.value?.scrollTop ?? 0
    }

    const restoreScroll = async (): Promise<void> => {
        await nextTick()

        if(scrollContainer.value)
            scrollContainer.value.scrollTop = scrollState.value
    }

    const resetScroll = async (): Promise<void> => {
        await nextTick()

        if(scrollContainer.value)
            scrollContainer.value.scrollTop = 0
    }

    watch(
        () => activePart.value?.segments.join('/'),
        async () => {
            if(!activePart.value)
                return

            sectionState.value = {
                ...sectionState.value,
                [activePart.value.article.slug] : true
            }

            chapterState.value = {
                ...chapterState.value,
                [chapterKey(activePart.value.article.slug, activePart.value.chapter.slug)] : true
            }

            closeMobileSidebar()
            await restoreScroll()
        },
        {
            immediate : true
        }
    )

    watch(
        () => normalizedQuery.value,
        async value => {
            if(!value) {
                await restoreScroll()
                return
            }

            await resetScroll()
        }
    )

    watch(
        isMobileOpen,
        async isOpen => {
            if(import.meta.client)
                document.body.style.overflow = isOpen ? 'hidden' : ''

            if(isOpen)
                await restoreScroll()
        }
    )

    onMounted(async () => {
        await restoreScroll()
    })

    onBeforeUnmount(() => {
        if(import.meta.client)
            document.body.style.overflow = ''
    })
</script>

<style scoped>
    .no-scrollbar {
        scrollbar-width: none;
    }

    .no-scrollbar::-webkit-scrollbar {
        display: none;
    }
</style>
