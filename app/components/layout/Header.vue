<template>
    <nav class="fixed top-0 z-50 w-full border-b border-autumn-border  backdrop-blur-sm">
        <div class="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div class="flex justify-between items-center h-16">
                <div class="flex items-center">
                    <NuxtLink to="/" class="flex items-center gap-2 group">
                        <Leaf class="w-6 h-6 text-autumn-accent group-hover:text-autumn-accent-dark transition-colors" />
                        <span class="font-bold text-xl tracking-tight text-autumn-text">
                            {{ name }}
                        </span>
                    </NuxtLink>

                    <div class="hidden md:flex ml-10 space-x-8">
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

                <div class="flex items-center gap-4">
                    <ButtonGithub />

                    <ButtonPrimary
                        size="md" 

                        class="hidden md:inline-flex items-center justify-center"
                    
                        @click="() => router.push('/documentation/get-started')" 
                    >
                        {{ $t('common.cta') }}
                    </ButtonPrimary>

                    <button
                        class="md:hidden text-autumn-text-secondary hover:text-autumn-text"
                        @click="toggleMenu"
                    >
                        <X v-if="isMobileMenuOpen" class="w-6 h-6" />
                        <Menu v-else class="w-6 h-6" />
                    </button>
                </div>
            </div>
        </div>

        <div
            v-if="isMobileMenuOpen"
            class="md:hidden border-t border-autumn-border bg-autumn-bg"
        >
            <div class="px-2 pt-2 pb-3 space-y-1 sm:px-3">
                <NuxtLink
                    v-for="link in navLinks"
                    :key="link.path"
                    :to="link.path"
                    @click="closeMenu"
                    class="block px-3 py-2 rounded-md text-base font-medium"
                    :class="isActive(link.path) && link.path !== '/' 
                        ? 'bg-autumn-bg-hover text-autumn-accent'
                        : 'text-autumn-text-secondary hover:bg-autumn-bg-hover hover:text-autumn-text'"
                >
                    {{ link.name }}
                </NuxtLink>

                <NuxtLink
                    to="/docs/get-started"
                    
                    class="block px-3 py-2 mt-4 rounded-md text-base font-medium bg-autumn-accent text-autumn-bg text-center"
                    
                    @click="closeMenu"
                >
                    {{ $t('component.header.routes.cta') }}
                </NuxtLink>
            </div>
        </div>
    </nav>
</template>

<script setup lang="ts">
    import { Leaf, Menu, X } from 'lucide-vue-next'

    const route = useRoute()
    const router = useRouter()
    const config = useRuntimeConfig()

    const name = config.public.name

    const isMobileMenuOpen = ref(false)

    const navLinks = computed(() => [
        { 
            name : $t('component.header.routes.documentation'), 
            path : '/docs' 
        },
        // { 
        //     name : $t('component.header.routes.benchmarks'), 
        //     path : '/benchmarks' 
        // },
        { 
            name : $t('component.header.routes.roadmap'), 
            path : '/roadmap' 
        },
        { 
            name : $t('component.header.routes.releases'), 
            path : '/releases' 
        }
    ])

    const isActive = (path: string): boolean => route.path.startsWith(path)

    const toggleMenu = (): boolean => isMobileMenuOpen.value = !isMobileMenuOpen.value
    const closeMenu = (): boolean => isMobileMenuOpen.value = false
</script>