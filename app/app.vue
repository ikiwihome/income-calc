<script setup>
import { ref, onMounted } from 'vue'

const colorMode = useColorMode()
const themeClass = ref('')

onMounted(() => {
  // 只在客户端设置偏好，避免 SSR 渲染出与客户端不一致的类
  colorMode.preference = 'light'
  themeClass.value = colorMode.value || ''
})
</script>

<template>
  <div class="min-h-screen" :class="themeClass">
    <NuxtPage />
  </div>
</template>
