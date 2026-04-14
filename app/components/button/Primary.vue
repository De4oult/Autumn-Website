<template>
    <button
        class="rounded-md bg-autumn-accent text-autumn-bg hover:bg-autumn-accent-dark transition hover:cursor-pointer duration-300"
        :class="size"
    >
        <slot></slot>
    </button>
</template>

<script setup lang="ts">
    type Size = 'md' | 'lg';

    const props = defineProps<{
        size : Size
    }>()

    const size = computed(() => {
        switch(props.size) {
            case 'lg':
                return 'px-8 py-3 text-base font-medium'
            case 'md':
            default:
                return 'px-4 py-2 text-sm font-normal'
        }
    })
</script>