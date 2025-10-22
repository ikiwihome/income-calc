<script setup>
const colorMode = useColorMode()
// 设置默认主题为light
colorMode.preference = 'light'
</script>

<template>
  <div class="min-h-screen" :class="colorMode.value">
    <NuxtPage />
  </div>
</template>
