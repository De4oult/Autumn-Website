<template>
    <div class="p-6 rounded-xl backdrop-blur-sm border border-autumn-border">
        <h3 class="text-lg font-bold mb-2">
            {{ title }}
        </h3>
        <p class="text-sm text-autumn-text-secondary">
            {{ description }}
        </p>
    </div>
</template>

<script setup lang="ts">
    defineProps<{
        title: string
        description: string
    }>()
</script>