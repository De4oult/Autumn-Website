<template>
    <section class="bg-autumn-bg-card border border-autumn-border rounded-xl p-6 shadow-lg">
        <h2 class="text-xl font-bold mb-2 text-autumn-text">
            {{ title }}
        </h2>

        <p class="text-sm text-autumn-text-secondary mb-6">
            {{ subtitle }}
        </p>

        <ClientOnly>
            <div class="h-80">
                <VisXYContainer
                    :data="data"
                    :height="320"
                    :padding="{ top: 8, right: 12, bottom: 0, left: 0 }"
                >
                    <VisGroupedBar
                        :x="chartIndex"
                        :y="chartValue"
                        :color="chartColor"
                        :orientation="Orientation.Horizontal"
                        :rounded-corners="6"
                        :bar-padding="0.35"
                        :group-padding="0.22"
                    />

                    <VisAxis
                        type="x"
                        :tick-format="tickFormatter"
                        :tick-values="tickValues"
                        :grid-line="true"
                        :domain-line="false"
                        :tick-line="false"
                    />

                    <VisAxis
                        type="y"
                        :tick-format="frameworkFormatter"
                        :grid-line="false"
                        :domain-line="true"
                        :tick-line="false"
                    />
                </VisXYContainer>
            </div>

            <template #fallback>
                <div class="h-80 rounded-lg border border-autumn-border/60 bg-autumn-bg-light/40"></div>
            </template>
        </ClientOnly>
    </section>
</template>

<script setup lang="ts">
    import { Orientation }                            from '@unovis/ts'
    import { VisAxis, VisGroupedBar, VisXYContainer } from '@unovis/vue'

    export type BenchmarkChartRow = {
        framework: string
        value: number
        color: string
    }

    const props = defineProps<{
        title: string
        subtitle: string
        data: BenchmarkChartRow[]
        tickValues: number[]
        tickFormatter: (tick: number | Date) => string
        valueFormatter: (value: number) => string
    }>()

    const chartIndex = (_row: BenchmarkChartRow, index: number): number => index
    const chartValue = (row: BenchmarkChartRow): number => row.value
    const chartColor = (row: BenchmarkChartRow): string => row.color
    const frameworkFormatter = (_tick: number | Date, index: number): string => props.data[index]?.framework ?? ''
</script>

<style scoped>
    :deep(.vis-axis__tick-label) {
        fill: var(--color-autumn-text-secondary);
        font-size: 12px;
    }

    :deep(.vis-axis__grid-line) {
        stroke: var(--color-autumn-border);
        opacity: 0.45;
        stroke-dasharray: 2 4;
    }

    :deep(.vis-axis__domain) {
        stroke: rgba(173, 162, 149, 0.75);
    }

    :deep(.vis-axis__tick) line {
        stroke: rgba(173, 162, 149, 0.75);
    }
</style>
