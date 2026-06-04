<template>
    <NuxtLayout>
        <NuxtPage />
    </NuxtLayout>
</template>

<script setup lang="ts">
    const config = useRuntimeConfig()
    const localeHead = useLocaleHead({
        seo : false
    })

    const siteName = `${config.public.name} Framework`

    useHead(() => ({
        titleTemplate : title => title ? `${title} · ${siteName}` : siteName,
        htmlAttrs     : localeHead.value.htmlAttrs,
        link          : localeHead.value.link,
        meta          : [
            ...(localeHead.value.meta || [])
        ]
    }))
</script>
