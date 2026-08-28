<script setup lang="ts">
import { Check } from '@lucide/vue'

defineProps<{
  steps: Array<{ title: string }>
  currentStep: number
  progress: string
}>()

defineEmits<{ edit: [step: number] }>()
</script>

<template>
  <nav class="stepper" aria-label="计算步骤">
    <div class="step-line"><span :style="{ width: progress }" /></div>
    <button
      v-for="(step, index) in steps"
      :key="step.title"
      class="step"
      :class="{ active: index === currentStep, done: index < currentStep }"
      :aria-current="index === currentStep ? 'step' : undefined"
      @click="index < currentStep ? $emit('edit', index) : undefined"
    >
      <span class="step-number">
        <Check v-if="index < currentStep" :size="16" />
        <b v-else>{{ String(index + 1).padStart(2, '0') }}</b>
      </span>
      <span class="step-label"><b>{{ step.title }}</b><small>{{ index < currentStep ? '已核对' : index === currentStep ? '正在填写' : '待填写' }}</small></span>
    </button>
  </nav>
</template>
