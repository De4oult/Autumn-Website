<template>
    <div class="relative overflow-x-clip backdrop-blur-sm">
        <div class="relative mx-auto max-w-7xl px-4 pt-24 pb-16 sm:px-6 lg:px-8">
            <div class="flex flex-col md:flex-row">
                <DocumentationSidebar />

                <section class="min-w-0 flex-1 pt-8 md:pt-0 md:pl-8 lg:pl-12">
                    <NuxtPage v-slot="{ Component, route: pageRoute }">
                        <Transition
                            name="documentation-content"
                            mode="out-in"
                        >
                            <div
                                :key="pageRoute.fullPath"
                                class="min-w-0"
                            >
                                <component :is="Component" />
                            </div>
                        </Transition>
                    </NuxtPage>
                </section>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    await useDocumentation()
</script>

<style scoped>
    .documentation-content-enter-active,
    .documentation-content-leave-active {
        transition:
            opacity 180ms ease,
            transform 180ms ease,
            filter 180ms ease;
    }

    .documentation-content-enter-from,
    .documentation-content-leave-to {
        opacity: 0;
        transform: translateY(10px);
        filter: blur(6px);
    }
</style>
