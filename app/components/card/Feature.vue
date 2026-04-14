<template>
    <div class="h-full p-5 sm:p-6 rounded-xl bg-autumn-bg-card/50 backdrop-blur-sm border border-autumn-border hover:border-autumn-accent/50 transition-colors duration-300">
        <component
            :is="icon" 
        
            :size="32"

            class="text-autumn-accent mb-4 transition-transform"
        />
        
        <h3 class="text-lg font-semibold mb-2">
            {{ title }}
        </h3>
        <p class="text-autumn-text-secondary text-sm leading-relaxed">
            {{ description }}
        </p>
    </div>
</template>

<script setup lang="ts">
    defineProps<{
        icon: any
        title: string
        description: string
    }>()
</script>
