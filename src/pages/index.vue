<template>
  <div class="container">
    <SalaryCalculator />
  </div>
</template>

<script setup lang="ts">
import SalaryCalculator from '~/components/SalaryCalculator.vue'
</script>

<style scoped>
.container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 20px;
}
</style>
