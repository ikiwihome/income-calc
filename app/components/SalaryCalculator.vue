<script setup lang="ts">
import { nextTick, watch } from 'vue'
import {
  ArrowLeft, ArrowRight, Check, ChevronDown, CircleCheck,
  Download, Info,
} from '@lucide/vue'
import { useSalaryCalculator } from '@/composables/useSalaryCalculator'
import { rangesAreEqual } from '@/utils/cityPolicies'
import SalaryCalculatorLiveEstimate from './SalaryCalculatorLiveEstimate.vue'
import SalaryCalculatorStepper from './SalaryCalculatorStepper.vue'

const steps = [
  { title: '工资情况' },
  { title: '五险一金' },
  { title: '专项扣除' },
  { title: '到手结果' },
]

const {
  currentStep, salaryMode, showAdvancedRates, showFormula, exportingExcel, state,
  cityPolicy, policy, deductionCatalog, supplementalHousingMax, supplementalHousingHint,
  result, averageMonthlyNet, averageMonthlyFinalIncome, averageContributions,
  progress, canContinue, money, setYear, setCity, toggleDeduction, next, previous, editStep, exportExcel,
  cityOptions, supportedYears,
} = useSalaryCalculator()

watch(currentStep, async () => {
  await nextTick()

  const content = document.querySelector<HTMLElement>('.step-content')
  content?.scrollTo({ top: 0 })

  if (window.matchMedia('(max-width: 900px)').matches) {
    const reduceMotion = window.matchMedia('(prefers-reduced-motion: reduce)').matches
    document.querySelector('.wizard-card')?.scrollIntoView({
      behavior: reduceMotion ? 'auto' : 'smooth',
      block: 'start',
    })
  }
})
</script>

<template>
  <main class="app-shell">
    <header class="journey-header">
      <section class="hero">
        <div class="hero-kicker"><span>收入台账</span><b>{{ cityPolicy.name }} · {{ state.year }}</b></div>
        <h1>把工资，<em>算明白。</em></h1>
        <p>从税前数字到每月实发，逐项核对社保、公积金与个税。</p>
      </section>

      <SalaryCalculatorStepper
        :steps="steps"
        :current-step="currentStep"
        :progress="progress"
        @edit="editStep"
      />
    </header>

    <div class="workspace">
      <section class="wizard-card">
        <div v-if="currentStep === 0" class="step-content">
          <div class="section-heading">
            <span class="section-index">01</span>
            <div><h2>先选择城市和年度</h2><p>政策按主要工作城市匹配，再输入每月税前工资（五险一金扣除前）。</p></div>
          </div>

          <div class="field-block">
            <label>参保与公积金缴存城市</label>
            <div class="city-grid">
              <button
                v-for="city in cityOptions" :key="city.code" class="choice-card"
                :class="{ selected: state.city === city.code }" :aria-pressed="state.city === city.code"
                @click="setCity(city.code)">
                <CircleCheck v-if="state.city === city.code" :size="18" />
                <span>{{ city.name }}</span>
              </button>
            </div>
          </div>

          <div class="field-block">
            <label>计算年度</label>
            <div class="year-grid">
              <button
                v-for="year in supportedYears" :key="year" class="choice-card"
                :class="{ selected: state.year === year }" :aria-pressed="state.year === year" @click="setYear(year)">
                <CircleCheck v-if="state.year === year" :size="18" />
                <span>{{ year }} 年</span>
              </button>
            </div>
          </div>

          <div class="policy-note">
            <Info :size="18" />
            <div><b>{{ cityPolicy.name }} {{ policy.label }}已匹配</b><p>核验于 {{ policy.verifiedOn }}。1–6 月与 7–12 月分别计算；标记为暂行的区间沿用最近已公布标准。</p></div>
          </div>

          <div class="field-block">
            <label>工资发放方式</label>
            <div class="segmented">
              <button :class="{ active: salaryMode === 'same' }" @click="salaryMode = 'same'">每月相同</button>
              <button :class="{ active: salaryMode === 'monthly' }" @click="salaryMode = 'monthly'">每月不同 / 含奖金</button>
            </div>
          </div>

          <div v-if="salaryMode === 'same'" class="field-block salary-field">
            <label for="base-salary">每月税前工资</label>
            <div class="money-input"><span>¥</span><input id="base-salary" v-model.number="state.baseSalary" type="number" min="0" step="100"><em>元 / 月</em></div>
            <small>将用于填充全年 12 个月，你仍可切换到“每月不同”单独修改。</small>
          </div>

          <div v-else class="month-grid">
            <label v-for="(_, index) in state.salaries" :key="index">
              <span>{{ index + 1 }} 月</span>
              <div><i>¥</i><input v-model.number="state.salaries[index]" type="number" min="0"></div>
            </label>
          </div>
        </div>

        <div v-else-if="currentStep === 1" class="step-content">
          <div class="section-heading">
            <span class="section-index">02</span>
            <div><h2>确认五险一金缴费基数</h2><p>缴费基数通常是上年度月平均工资，并不一定等于本月工资。</p></div>
          </div>

          <div class="policy-note warm">
            <Info :size="18" />
            <div><b>为什么要分上下半年？</b><p>多地会在年中调整社保或公积金口径。申报数超出范围时，将按对应险种的上下限分别计算。</p></div>
          </div>

          <div class="period-cards">
            <article v-for="(period, index) in policy.periods" :key="index" class="period-card">
              <div class="period-title"><span>{{ index === 0 ? '1–6 月' : '7–12 月' }}</span><small>{{ index === 0 ? '上半年度' : '下半年度' }}</small></div>
              <label>社保申报工资<div class="inline-input"><span>¥</span><input v-model.number="state.socialBases[index]" type="number" min="0"></div></label>
              <p v-if="rangesAreEqual(period)">社保范围 ¥{{ money(period.pension.min, 0) }} – ¥{{ money(period.pension.max, 0) }}</p>
              <p v-else class="range-list">养老 ¥{{ money(period.pension.min, 0) }}–{{ money(period.pension.max, 0) }} · 医疗 ¥{{ money(period.medical.min, 0) }}–{{ money(period.medical.max, 0) }} · 失业 ¥{{ money(period.unemployment.min, 0) }}–{{ money(period.unemployment.max, 0) }}</p>
              <label>公积金申报工资<div class="inline-input"><span>¥</span><input v-model.number="state.housingBases[index]" type="number" min="0"></div></label>
              <p>政策范围 ¥{{ money(period.housing.min, 0) }} – ¥{{ money(period.housing.max, 0) }} <b v-if="period.provisional">暂行</b></p>
            </article>
          </div>

          <button class="advanced-toggle" @click="showAdvancedRates = !showAdvancedRates">
            <span>个人缴费比例</span><ChevronDown :size="18" :class="{ rotate: showAdvancedRates }" />
          </button>
          <div v-if="showAdvancedRates" class="rates-grid">
            <label>养老保险 <div><input v-model.number="state.rates.pension" type="number" step="0.1"><span>%</span></div></label>
            <label>医疗保险 <div><input v-model.number="state.rates.medical" type="number" step="0.1"><span>%</span></div></label>
            <label>失业保险 <div><input v-model.number="state.rates.unemployment" type="number" step="0.1"><span>%</span></div></label>
            <label>住房公积金 <div><input v-model.number="state.rates.housing" type="number" :min="cityPolicy.housingRate[0]" :max="cityPolicy.housingRate[1]" step="1"><span>%</span></div></label>
            <label>补充公积金 <div><input v-model.number="state.rates.supplementalHousing" type="number" min="0" :max="supplementalHousingMax" :disabled="supplementalHousingMax === 0" step="1"><span>%</span></div></label>
            <p v-if="state.rates.medicalFixed" class="rate-footnote">另计医疗保险固定缴费 ¥{{ money(state.rates.medicalFixed, 0) }}/月</p>
            <p class="rate-footnote">{{ supplementalHousingHint }}</p>
          </div>
        </div>

        <div v-else-if="currentStep === 2" class="step-content">
          <div class="section-heading">
            <span class="section-index">03</span>
            <div><h2>选择你能享受的专项附加扣除</h2><p>只开启符合本人实际情况的项目，扣除额不是补贴，而是减少计税收入。</p></div>
          </div>

          <div class="method-switch">
            <button :class="{ selected: state.declarationMethod === 'monthly' }" @click="state.declarationMethod = 'monthly'">
              <b>单位每月申报</b><small>每月少预扣税，更贴近工资条</small>
            </button>
            <button :class="{ selected: state.declarationMethod === 'annual' }" @click="state.declarationMethod = 'annual'">
              <b>年度汇算申报</b><small>平时多预扣，汇算时预计退税</small>
            </button>
          </div>

          <div class="deduction-list">
            <article v-for="item in deductionCatalog" :key="item.key" class="deduction-item" :class="{ enabled: state.deductions[item.key].enabled }">
              <button class="check-control" :aria-pressed="state.deductions[item.key].enabled" @click="toggleDeduction(item.key)">
                <span><Check v-if="state.deductions[item.key].enabled" :size="15" /></span>
                <div><b>{{ item.name }}</b><small>{{ item.hint }}</small></div>
              </button>
              <div v-if="state.deductions[item.key].enabled" class="deduction-fields">
                <label>本人每月扣除额<div class="inline-input compact"><span>¥</span><input v-model.number="state.deductions[item.key].amount" type="number" min="0" :max="item.max"></div></label>
                <label>适用月份<div class="month-range"><select v-model.number="state.deductions[item.key].startMonth"><option v-for="m in 12" :key="m" :value="m">{{ m }} 月</option></select><i>至</i><select v-model.number="state.deductions[item.key].endMonth"><option v-for="m in 12" :key="m" :value="m">{{ m }} 月</option></select></div></label>
              </div>
            </article>
          </div>

          <div class="annual-fields">
            <label><span>大病医疗年度可扣除额 <small>仅年度汇算：医保目录内自付超过 15,000 元的部分，最高 80,000 元</small></span><div class="inline-input compact"><span>¥</span><input v-model.number="state.annualMedicalDeduction" type="number" min="0" max="80000"></div></label>
            <label><span>其他税前扣除 <small>如符合规定的企业年金、商业健康保险等，每月金额</small></span><div class="inline-input compact"><span>¥</span><input v-model.number="state.otherMonthlyDeduction" type="number" min="0"></div></label>
          </div>
        </div>

        <div v-else class="step-content results-step">
          <div class="result-overview">
            <div class="result-hero">
              <div><span>{{ state.year }} 年预计最终到手</span><strong>¥ {{ money(result.finalAnnualIncome) }}</strong><p>含年度汇算预计{{ result.estimatedRefund >= 0 ? '退税' : '补税' }} ¥{{ money(Math.abs(result.estimatedRefund)) }}</p></div>
              <div class="net-ring"><span>到手率</span><b>{{ result.annualGross ? Math.round(result.finalAnnualIncome / result.annualGross * 100) : 0 }}%</b></div>
            </div>

            <div class="summary-grid">
              <div><span>全年税前</span><b>¥{{ money(result.annualGross) }}</b></div>
              <div><span>个人五险一金</span><b>− ¥{{ money(result.annualContributions) }}</b></div>
              <div><span>年度应纳个税</span><b>− ¥{{ money(result.annualSettlementTax) }}</b></div>
              <div class="highlight"><span>月均实发</span><b>¥{{ money(averageMonthlyNet) }}</b></div>
            </div>
          </div>

          <div class="monthly-detail">
            <h3>逐月计算明细 <small>个税使用累计预扣法，因此工资相同也可能出现月度税额变化</small></h3>
            <div class="table-scroll">
              <table>
                <thead><tr><th>月份</th><th>税前工资</th><th>五险一金</th><th>专项扣除</th><th>本月个税</th><th>实发工资</th><th /></tr></thead>
                <tbody>
                  <template v-for="month in result.months" :key="month.month">
                    <tr>
                      <td>{{ month.month }} 月</td><td>¥{{ money(month.gross) }}</td><td>−¥{{ money(month.contributions) }}</td><td>¥{{ money(month.specialDeduction) }}</td><td>−¥{{ money(month.tax) }}</td><td class="net-cell">¥{{ money(month.net) }}</td>
                      <td><button class="detail-button" :aria-label="`${month.month}月计算过程`" @click="showFormula = showFormula === month.month ? null : month.month"><ChevronDown :size="16" :class="{ rotate: showFormula === month.month }" /></button></td>
                    </tr>
                    <tr v-if="showFormula === month.month" class="formula-row"><td colspan="7">
                      <div class="formula-grid">
                        <span>养老基数 <b>¥{{ money(month.pensionBase) }}</b></span><span>医疗基数 <b>¥{{ money(month.medicalBase) }}</b></span><span>失业基数 <b>¥{{ money(month.unemploymentBase) }}</b></span><span>公积金基数 <b>¥{{ money(month.housingBase) }}</b></span><span>养老 {{ state.rates.pension }}% <b>¥{{ money(month.pension) }}</b></span><span>医疗 {{ state.rates.medical }}% <b>¥{{ money(month.medical) }}</b></span><span>失业 {{ state.rates.unemployment }}% <b>¥{{ money(month.unemployment) }}</b></span><span>公积金 {{ state.rates.housing }}% <b>¥{{ money(month.housing) }}</b></span>
                      </div>
                      <p>截至本月累计应纳税所得额 ¥{{ money(month.cumulativeTaxable) }}，适用预扣率 {{ month.taxRate * 100 }}%。本月个税 = 累计应纳税额 − 此前已预扣税额。</p>
                    </td></tr>
                  </template>
                </tbody>
              </table>
            </div>
          </div>

        </div>

        <footer class="wizard-actions">
          <button v-if="currentStep > 0" class="secondary-button" @click="previous"><ArrowLeft :size="17" />上一步</button>
          <span v-else />
          <button v-if="currentStep < 3" class="primary-button" :disabled="!canContinue" @click="next">继续：{{ steps[currentStep + 1]?.title }}<ArrowRight :size="17" /></button>
          <div v-else class="result-actions">
            <button class="secondary-button export-button" :disabled="exportingExcel" @click="exportExcel"><Download :size="17" />{{ exportingExcel ? '正在导出' : '导出 Excel' }}</button>
            <button class="primary-button" @click="editStep(0)">重新计算<ArrowRight :size="17" /></button>
          </div>
        </footer>
      </section>

      <SalaryCalculatorLiveEstimate
        :city-name="cityPolicy.name"
        :year="state.year"
        :result="result"
        :average-monthly-net="averageMonthlyNet"
        :average-monthly-final-income="averageMonthlyFinalIncome"
        :average-contributions="averageContributions"
      />
    </div>

    <footer class="page-footer">结果仅供测算，不构成纳税申报或法律意见。实际金额可能因单位申报基数、四舍五入口径及其他收入而不同。</footer>
  </main>
</template>
