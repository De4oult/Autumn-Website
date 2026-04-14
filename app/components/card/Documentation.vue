<template>
    <NuxtLink
        :to="localizedTo"
        
        class="block h-full p-5 sm:p-6 rounded-xl bg-autumn-bg-card/40 backdrop-blur-sm border border-autumn-border hover:border-autumn-accent/50 hover:bg-autumn-bg-hover transition-all hover:cursor-pointer duration-300"
    >
        <component 
            :is="icon" 
            
            :size="24" 
            class=" text-autumn-accent mb-3 transition-transform"
        />
        <h3 class="font-semibold mb-1">
            {{ title }}
        </h3>
        <p class="text-sm text-autumn-text-secondary">
            {{ description }}
        </p>
    </NuxtLink>
</template>

<script setup lang="ts">
    const props = defineProps<{
        icon: any
        title: string
        description: string
        to?: string
    }>()

    const localePath = useLocalePath()
    const localizedTo = computed(() => props.to ? localePath(props.to) : localePath('/documentation'))
</script>
