<template>
    <div class="flex flex-col min-h-screen bg-autumn-bg text-autumn-text font-sans selection:bg-autumn-accent/30 selection:text-autumn-text">
        <LayoutFallenLeaves intensity="strong" />
        
        <LayoutHeader />
        
        <main class="w-full h-screen">
            <slot></slot>
            <LayoutFooter />
        </main>
    </div>
</template>