<template>
    <DocumentationCode
        class="documentation-code-block"
        :tabs="tabs"
    />
</template>

<script setup lang="ts">
    const props = defineProps({
        code : {
            type    : String,
            default : ''
        },
        language : {
            type    : String,
            default : 'text'
        },
        filename : {
            type    : String,
            default : null
        }
    })

    const languageLabels: Record<string, string> = {
        bash       : 'Terminal',
        console    : 'Console',
        javascript : 'JavaScript',
        js         : 'JavaScript',
        json       : 'JSON',
        py         : 'Python',
        python     : 'Python',
        sh         : 'Shell',
        ts         : 'TypeScript',
        typescript : 'TypeScript',
        yaml       : 'YAML',
        yml        : 'YAML'
    }

    const tabs = computed(() => [
        {
            name : props.filename
                || languageLabels[props.language]
                || props.language.toUpperCase()
                || 'Code',
            code : props.code,
            lang : props.language
        }
    ])
</script>
