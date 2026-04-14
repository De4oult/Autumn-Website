<template>
    <nav class="fixed top-0 z-50 w-full border-b border-autumn-border bg-autumn-bg/70 backdrop-blur-sm">
        <div class="relative z-20 max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center min-w-0">
                    <NuxtLink to="/" class="flex items-center gap-2 group">
                        <Leaf class="w-6 h-6 text-autumn-accent group-hover:text-autumn-accent-dark transition-colors" />
                        <span class="font-bold text-lg sm:text-xl tracking-tight text-autumn-text truncate">
                            {{ name }}
                        </span>
                    </NuxtLink>

                    <div class="hidden md:flex ml-8 lg:ml-10 space-x-6 lg:space-x-8">
                        <NuxtLink
                            v-for="link in navLinks"

                            :key="link.path"
                            :to="link.path"

                            class="text-sm font-medium transition-colors hover:text-autumn-accent"
                            :class="isActive(link.path) && link.path !== '/' 
                                ? 'text-autumn-accent' 
                                : 'text-autumn-text-secondary'"
                        >
                            {{ link.name }}
                        </NuxtLink>
                    </div>
                </div>

                <div class="flex items-center gap-3 sm:gap-4">
                    <ButtonGithub />

                    <div class="hidden md:flex">
                        <ButtonPrimary
                            size="md" 
                        
                            @click="() => router.push(localePath('/documentation'))" 
                        >
                            {{ $t('common.cta') }}
                        </ButtonPrimary>
                    </div>

                    <button
                        class="md:hidden text-autumn-text-secondary hover:text-autumn-text"
                        @click="toggleMenu"
                    >
                        <motion.div
                            class="flex items-center justify-center"
                            :animate="{
                                rotate: isMobileMenuOpen ? 90 : 0,
                                scale: isMobileMenuOpen ? 0.92 : 1
                            }"
                            :transition="{
                                duration: 0.2,
                                ease: [0.22, 1, 0.36, 1]
                            }"
                        >
                            <X v-if="isMobileMenuOpen" class="w-6 h-6" />
                            <Menu v-else class="w-6 h-6" />
                        </motion.div>
                    </button>
                </div>
            </div>
        </div>

        <AnimatePresence>
            <motion.button
                v-if="isMobileMenuOpen"
                type="button"
                aria-label="Close mobile menu"
                class="fixed inset-x-0 top-16 bottom-0 bg-black/45 md:hidden"
                :initial="{ opacity: 0 }"
                :animate="{ opacity: 1 }"
                :exit="{ opacity: 0 }"
                :transition="{ duration: 0.2, ease: 'easeOut' }"
                @click="closeMenu"
            />

            <motion.div
                v-if="isMobileMenuOpen"
                class="relative z-10 overflow-hidden border-t border-autumn-border bg-autumn-bg/95 shadow-2xl backdrop-blur-xl md:hidden"
                :initial="{ opacity: 0, height: 0 }"
                :animate="{
                    opacity: 1,
                    height: 'auto',
                    transition: {
                        duration: 0.24,
                        ease: [0.22, 1, 0.36, 1]
                    }
                }"
                :exit="{
                    opacity: 0,
                    height: 0,
                    transition: {
                        duration: 0.18,
                        ease: [0.4, 0, 1, 1]
                    }
                }"
            >
                <motion.div
                    class="px-3 pt-3 pb-4 space-y-2"
                    :initial="{ opacity: 0, y: -10 }"
                    :animate="{
                        opacity: 1,
                        y: 0,
                        transition: {
                            delay: 0.03,
                            duration: 0.2,
                            staggerChildren: 0.05,
                            delayChildren: 0.05
                        }
                    }"
                    :exit="{
                        opacity: 0,
                        y: -6,
                        transition: {
                            duration: 0.14,
                            staggerChildren: 0.03,
                            staggerDirection: -1
                        }
                    }"
                >
                    <motion.div
                        v-for="link in navLinks"
                        :key="link.path"
                        :initial="{ opacity: 0, y: -8 }"
                        :animate="{ opacity: 1, y: 0 }"
                        :exit="{ opacity: 0, y: -6 }"
                        :transition="{ duration: 0.18, ease: [0.22, 1, 0.36, 1] }"
                    >
                        <NuxtLink
                            :to="link.path"
                            @click="closeMenu"
                            class="block px-3 py-3 rounded-md text-base font-medium"
                            :class="isActive(link.path) && link.path !== '/' 
                                ? 'bg-autumn-bg-hover text-autumn-accent'
                                : 'text-autumn-text-secondary hover:bg-autumn-bg-hover hover:text-autumn-text'"
                        >
                            {{ link.name }}
                        </NuxtLink>
                    </motion.div>

                    <motion.div
                        :initial="{ opacity: 0, y: -8 }"
                        :animate="{ opacity: 1, y: 0 }"
                        :exit="{ opacity: 0, y: -6 }"
                        :transition="{ duration: 0.2, ease: [0.22, 1, 0.36, 1] }"
                    >
                        <NuxtLink
                            :to="localePath('/documentation')"
                            
                            class="block px-3 py-3 mt-4 rounded-md text-base font-medium bg-autumn-accent text-autumn-bg text-center"
                            
                            @click="closeMenu"
                        >
                            {{ $t('component.header.routes.cta') }}
                        </NuxtLink>
                    </motion.div>
                </motion.div>
            </motion.div>
        </AnimatePresence>
    </nav>
</template>

<script setup lang="ts">
    import { AnimatePresence, motion } from 'motion-v'
    import { Leaf, Menu, X }           from 'lucide-vue-next'

    const route = useRoute()
    const router = useRouter()
    const config = useRuntimeConfig()
    const localePath = useLocalePath()

    const name = config.public.name

    const isMobileMenuOpen = ref(false)

    const navLinks = computed(() => [
        // { 
        //     name : $t('component.header.routes.documentation'), 
        //     path : '/documentation' 
        // },
        // { 
        //     name : $t('component.header.routes.benchmarks'), 
        //     path : '/benchmarks' 
        // },
        // { 
        //     name : $t('component.header.routes.roadmap'), 
        //     path : '/roadmap' 
        // },
        // { 
        //     name : $t('component.header.routes.releases'), 
        //     path : '/releases' 
        // }
    ])

    const isActive = (path: string): boolean => route.path.startsWith(path)

    const toggleMenu = (): boolean => isMobileMenuOpen.value = !isMobileMenuOpen.value
    const closeMenu = (): boolean => isMobileMenuOpen.value = false
</script>
