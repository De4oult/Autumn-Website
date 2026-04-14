<template>
    <div class="flex flex-col min-h-screen bg-autumn-bg text-autumn-text font-sans selection:bg-autumn-accent/30 selection:text-autumn-text">
        <LayoutFallenLeaves :intensity="leavesIntensity" />
        
        <LayoutHeader />
        
        <main class="w-full">
            <div class="flex min-h-screen flex-col">
                <div class="flex-1">
                    <slot></slot>
                </div>
            </div>

            <LayoutFooter />
        </main>
    </div>
</template>

<script setup lang="ts">
    const isDesktop = useMediaQuery('(min-width: 768px)')
    const leavesIntensity = computed(() => isDesktop.value ? 'strong' : 'subtle')
</script>
