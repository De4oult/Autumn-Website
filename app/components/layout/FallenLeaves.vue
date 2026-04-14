<template>
    <div
        class="fixed inset-0 pointer-events-none overflow-hidden z-0 select-none"
        aria-hidden="true"
    >
        <div
            v-for="leaf in leaves"
            :key="leaf.id"
            class="absolute -top-10 animate-fall opacity-50 dark:opacity-30"
            :style="{
                left: leaf.left,
                animationDelay: leaf.delay,
                animationDuration: leaf.duration,
                transform: `rotate(${leaf.rotation})`
            }"
        >
            <div class="animate-sway">
                <svg
                    :width="leaf.size"
                    :height="leaf.size"
                    viewBox="0 0 24 24"
                    fill="none"
                    xmlns="http://www.w3.org/2000/svg"
                    class="drop-shadow-sm"
                >
                    <path
                        d="M12 2C12 2 8 6 8 12C8 15.3137 9.79086 18 12 18C14.2091 18 16 15.3137 16 12C16 6 12 2 12 2Z"
                        :fill="leaf.color"
                        opacity="0.9"
                    />
                    <path
                        d="M12 2C12 2 16 6 16 12C16 15.3137 14.2091 18 12 18"
                        :stroke="leaf.color"
                        stroke-width="0.5"
                        opacity="0.6"
                    />
                    <path
                        d="M12 2L12 18"
                        :stroke="leaf.color"
                        stroke-width="0.8"
                        opacity="0.4"
                    />
                </svg>
            </div>
        </div>
    </div>
</template>

<script setup lang="ts">
    import { onMounted, ref, watch } from 'vue'
    
    type Intensity = 'subtle' | 'normal' | 'strong'
    const props = withDefaults(defineProps<{ 
        intensity?: Intensity 
    }>(), { intensity : 'normal' })

    type Leaf = {
        id: number
        left: string
        delay: string
        duration: string
        size: number
        rotation: string
        color: string
    }

    const leaves = ref<Leaf[]>([])
    const colors = ['#F59E0B', '#F97316', '#EA580C', '#DC2626', '#92400E']
    const sizes = [16, 20, 24, 28, 32]

    const generate = () => {
        const count = props.intensity === 'subtle' ? 8 : props.intensity === 'normal' ? 20 : 35
        
        leaves.value = Array.from({ length : count }).map((_, i) => ({
            id       : i,
            left     : `${Math.random() * 100}%`,
            delay    : `${Math.random() * 10}s`,
            duration : `${12 + Math.random() * 8}s`,
            size     : sizes[Math.floor(Math.random() * sizes.length)],
            rotation : `${Math.random() * 360}deg`,
            color    : colors[Math.floor(Math.random() * colors.length)]
        }))
    }

    onMounted(() => generate())
    watch(() => props.intensity, generate)
</script>
