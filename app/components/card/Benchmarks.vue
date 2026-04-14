<template>
    <div class="p-6 rounded-2xl bg-autumn-bg-card/40 backdrop-blur-xs border border-autumn-border flex flex-col md:flex-row items-center justify-between gap-8">
        <div>
            <h2 class="text-xl font-bold mb-2">
                {{ $t('component.card.benchmarks.title') }}
            </h2>
            <p class="text-autumn-text-secondary mb-4 max-w-md text-sm">
                {{ $t('component.card.benchmarks.subtitle') }}                
            </p>

            <LinkText to="/documentation/examples">
                {{ $t('common.examples') }}<ArrowRight :size="16" class="ml-1" />
            </LinkText>
        </div>

        <div class="w-full md:w-1/2 space-y-4 text-sm">
            <div
                v-for="benchmark in benchmarks"
                :key="benchmark.name"
            >
                <div class="flex justify-between mb-1">
                    <span>
                        {{ benchmark.name }}
                    </span>

                    <span class="text-autumn-text-muted">
                        ~{{ benchmark.rps }} req/s
                    </span>
                </div>

                <div class="w-full bg-autumn-bg rounded-full h-2">
                    <div
                        class="h-2 rounded-full transition-all duration-700"
                        :class="benchmark.name === name
                            ? 'bg-autumn-accent'
                            : 'bg-autumn-border-light'"
                        :style="{ width: benchmark.percent + '%' }"
                    ></div>
                </div>
            </div>
        </div>
    </div></template>

<script lang="ts" setup>
    import { ArrowRight } from 'lucide-vue-next'

    const config = useRuntimeConfig()
    const name = config.public.name

    type Benchmark = {
        name: string
        rps: number
    }

    const rawBenchmarks: Benchmark[] = [
        { 
            name, 
            rps : 1970
        },
        { 
            name : 'FastAPI', 
            rps  : 3161
        },
        { 
            name : 'Flask', 
            rps  : 1228
        }
    ]

    const maxRps = Math.max(...rawBenchmarks.map(b => b.rps))

    const benchmarks = computed(() =>
        rawBenchmarks.map(benchmark => ({
            ...benchmark,
            percent : Math.round((benchmark.rps / maxRps) * 100)
        }))
    )
</script>