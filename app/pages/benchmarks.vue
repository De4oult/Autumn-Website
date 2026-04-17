<template>
    <div class="w-full max-w-5xl mx-auto px-4 py-16 pt-28">
        <div class="text-center mb-16">
            <h1 class="text-4xl md:text-5xl font-bold mb-4 text-autumn-text">
                {{ $t('page.benchmarks.title') }}
            </h1>

            <p class="text-xl text-autumn-text-secondary max-w-2xl mx-auto text-balance">
                {{ $t('page.benchmarks.subtitle') }}
            </p>
        </div>

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-16">
            <BenchmarkChartCard
                :title="$t('page.benchmarks.throughput.title')"
                :subtitle="$t('page.benchmarks.throughput.subtitle')"
                
                :data="throughputData"
                
                :tick-values="[0, 1000, 2000, 3000, 4000, 5000]"
                :tick-formatter="formatThroughputAxis"
                :value-formatter="formatExactThroughput"
            />

            <BenchmarkChartCard
                :title="$t('page.benchmarks.latency.title')"
                :subtitle="$t('page.benchmarks.latency.subtitle')"

                :data="latencyData"

                :tick-values="[0, 10, 20, 30, 40]"
                :tick-formatter="formatLatencyAxis"
                :value-formatter="formatExactLatency"
            />
        </div>
    </div>
</template>

<script setup lang="ts">
    import type { BenchmarkChartRow } from '~/components/benchmark/ChartCard.vue'

    const NEUTRAL_BAR_COLOR = '#5A4D43'
    const ACCENT_BAR_COLOR = '#F39C12'

    const frameworkResults = [
        { 
            name    : 'Flask', 
            rps     : 2149.76, 
            latency : 33.06, 
            color   : NEUTRAL_BAR_COLOR
        },
        { 
            name    : 'FastAPI', 
            rps     : 3644.17, 
            latency : 19.49, 
            color   : NEUTRAL_BAR_COLOR 
        },
        { 
            name    : 'Autumn', 
            rps     : 4006.67, 
            latency : 17.38, 
            color   : ACCENT_BAR_COLOR 
        },
        { 
            name    : 'Falcon', 
            rps     : 4471.53, 
            latency : 16.66, 
            color   : NEUTRAL_BAR_COLOR 
        }
    ]

    const throughputData: BenchmarkChartRow[] = frameworkResults.map((framework) => ({
        framework : framework.name,
        value     : framework.rps,
        color     : framework.color
    }))

    const latencyData: BenchmarkChartRow[] = frameworkResults.map((framework) => ({
        framework : framework.name,
        value     : framework.latency,
        color     : framework.color
    }))

    const formatThroughputAxis = (tick: number | Date): string =>
        typeof tick === 'number' ? tick.toLocaleString() : ''

    const formatLatencyAxis = (tick: number | Date): string =>
        typeof tick === 'number' ? `${tick.toFixed(0)} ms` : ''

    const formatExactThroughput = (value: number): string =>
        `${value.toFixed(2)} req/s`

    const formatExactLatency = (value: number): string =>
        `${value.toFixed(2)} ms`
</script>
