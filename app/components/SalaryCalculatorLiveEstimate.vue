<script setup lang="ts">
import type { CalculationResult } from '@/utils/taxCalculator'

defineProps<{
  cityName: string
  year: number
  result: CalculationResult
  averageMonthlyNet: number
  averageMonthlyFinalIncome: number
  averageContributions: {
    pension: number
    medical: number
    unemployment: number
    housing: number
    supplementalHousing: number
  }
}>()

const money = (value: number) => new Intl.NumberFormat('zh-CN', {
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
}).format(Number(value) || 0)
</script>

<template>
  <aside class="side-panel">
    <div class="live-card">
      <div class="receipt-edge" aria-hidden="true" />
      <div class="live-card-heading">
        <span class="live-label">PAYSLIP <b>实时工资条</b></span>
        <small>{{ cityName }} / {{ year }}</small>
      </div>
      <div class="net-amount">
        <p>当前月均实发</p><strong><small>¥</small>{{ money(averageMonthlyNet) }}</strong>
        <span>估算中</span>
      </div>

      <div class="detail-group">
        <div class="detail-group-title">收入概览</div>
        <span><i class="income" />月均税前工资 <b>¥{{ money(result.annualGross / 12) }}</b></span>
        <span><i class="insurance" />个人五险一金 <b>−¥{{ money(result.annualContributions / 12) }}</b></span>
        <span><i class="tax" />月均预扣个税 <b>−¥{{ money(result.annualWithheldTax / 12) }}</b></span>
      </div>

      <div class="detail-group contribution-detail">
        <div class="detail-group-title">五险一金明细</div>
        <span>养老保险 <b>−¥{{ money(averageContributions.pension) }}</b></span>
        <span>医疗保险 <b>−¥{{ money(averageContributions.medical) }}</b></span>
        <span>失业保险 <b>−¥{{ money(averageContributions.unemployment) }}</b></span>
        <span>住房公积金 <b>−¥{{ money(averageContributions.housing) }}</b></span>
        <span v-if="averageContributions.supplementalHousing > 0">补充公积金 <b>−¥{{ money(averageContributions.supplementalHousing) }}</b></span>
      </div>

      <div class="settlement-summary" :class="{ payment: result.estimatedRefund < 0 }">
        <span>年度汇算预计{{ result.estimatedRefund >= 0 ? '退税' : '补税' }}</span>
        <b>{{ result.estimatedRefund >= 0 ? '+' : '−' }}¥{{ money(Math.abs(result.estimatedRefund)) }}</b>
        <small>汇算后月均最终到手 ¥{{ money(averageMonthlyFinalIncome) }}</small>
      </div>
    </div>
  </aside>
</template>
