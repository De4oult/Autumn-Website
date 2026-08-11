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

        <div class="grid grid-cols-1 lg:grid-cols-2 gap-8 mb-8">
            <BenchmarkChartCard
                :title="$t('page.benchmarks.throughput.title')"
                :subtitle="$t('page.benchmarks.throughput.subtitle')"
                
                :data="throughputData"
                
                :tick-values="[0, 2000, 4000, 6000, 8000, 10000]"
                :tick-formatter="formatThroughputAxis"
                :value-formatter="formatExactThroughput"
            />

            <BenchmarkChartCard
                :title="$t('page.benchmarks.latency.title')"
                :subtitle="$t('page.benchmarks.latency.subtitle')"

                :data="latencyData"

                :tick-values="[0, 3, 6, 9, 12, 15]"
                :tick-formatter="formatLatencyAxis"
                :value-formatter="formatExactLatency"
            />
        </div>

        <BenchmarkChartCard
            :title="$t('page.benchmarks.scenarios.title')"
            :subtitle="$t('page.benchmarks.scenarios.subtitle')"

            :data="autumnScenarioData"

            :tick-values="[0, 2000, 4000, 6000, 8000, 10000]"
            :tick-formatter="formatThroughputAxis"
            :value-formatter="formatExactThroughput"
        />
    </div>
</template>

<script setup lang="ts">
    import type { BenchmarkChartRow } from '~/components/benchmark/ChartCard.vue'

    const { t } = useI18n()

    useAutumnSeo(() => ({
        title       : t('seo.benchmarks.title'),
        description : t('seo.benchmarks.description'),
        path        : '/benchmarks/'
    }))

    const NEUTRAL_BAR_COLOR = '#5A4D43'
    const ACCENT_BAR_COLOR = '#F39C12'

    const frameworkResults = [
        { 
            name       : 'Falcon',
            rps        : 8021.93,
            latency    : 9.33,
            color      : NEUTRAL_BAR_COLOR
        },
        {
            name       : 'Starlette',
            rps        : 7937.69,
            latency    : 9.58,
            color      : NEUTRAL_BAR_COLOR
        },
        {
            name       : 'Autumn',
            rps        : 7797.78,
            latency    : 9.62,
            color      : ACCENT_BAR_COLOR
        },
        {
            name       : 'FastAPI',
            rps        : 6336.61,
            latency    : 11.36,
            color      : NEUTRAL_BAR_COLOR
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

    const autumnScenarioData: BenchmarkChartRow[] = [
        { framework : 'Plaintext', value : 8107.42, color : ACCENT_BAR_COLOR },
        { framework : 'JSON', value : 8223.67, color : ACCENT_BAR_COLOR },
        { framework : 'Path parameter', value : 7993.92, color : ACCENT_BAR_COLOR },
        { framework : 'Validated body', value : 6866.13, color : ACCENT_BAR_COLOR }
    ]

    const formatThroughputAxis = (tick: number | Date): string =>
        typeof tick === 'number' ? tick.toLocaleString() : ''

    const formatLatencyAxis = (tick: number | Date): string =>
        typeof tick === 'number' ? `${tick.toFixed(0)} ms` : ''

    const formatExactThroughput = (value: number): string =>
        `${value.toFixed(2)} req/s`

    const formatExactLatency = (value: number): string =>
        `${value.toFixed(2)} ms`
</script>
