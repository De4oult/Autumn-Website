<template>
    <div class="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-autumn-bg-card border border-autumn-border text-xs font-medium text-autumn-accent">
        <span class="relative flex h-2 w-2">
            <span class="animate-ping absolute inline-flex h-full w-full rounded-full bg-autumn-accent opacity-75"></span>
            <span class="relative inline-flex rounded-full h-2 w-2 bg-autumn-accent"></span>
        </span>
        <slot></slot>
    </div>
</template>