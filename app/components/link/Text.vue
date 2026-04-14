<template>
    <NuxtLink
        :to="localizedTo"
        
        class="mt-3 text-autumn-accent inline-flex items-center hover:text-autumn-accent-dark hover:cursor-pointer duration-300"
    >
        <slot></slot>
    </NuxtLink>
</template>

<script setup lang="ts">
    const props = defineProps<{
        to: string
    }>()

    const localePath = useLocalePath()
    const localizedTo = computed(() => localePath(props.to))
</script>
