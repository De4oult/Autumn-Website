<script setup lang="ts">
    const localePath = useLocalePath()

    await navigateTo(localePath('/'), {
        redirectCode : 302,
        replace      : true
    })
</script>
