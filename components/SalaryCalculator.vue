<template>
  <div class="calculator-container">
    <h1>2025年最新工资税后收入计算器</h1>
    <h2 class="subtitle">一个可以精确到分的税后收入计算器</h2>

    <div class="top-row">
      <div class="form-group">
        <h3>选择年度<span class="help-icon" title="选择计算使用的税务年度，不同年度的社保和公积金缴费基数不同">?</span></h3>
        <select v-model="year">
          <option v-for="y in years" :value="y" :key="y">{{ y }}年</option>
        </select>
      </div>

      <div class="form-group">
        <h3>所在省市<span class="help-icon" title="选择所在省市以获取当地社保公积金缴纳标准">?</span></h3>
        <select v-model="city">
          <option v-for="(_, cityName) in cities" :value="cityName" :key="cityName">
            {{ cityName }}
          </option>
        </select>
      </div>
    </div>

    <div class="input-section">

      <div class="form-group">
        <h3>月度工资<span class="help-icon" title="输入每月扣除五险一金前的税前工资，1月输入后会自动填充到其他月份">?</span></h3>
        <div v-for="(salary, index) in monthlySalaries" :key="index" class="monthly-salary">
          <span>{{ index + 1 }}月:</span>
          <input type="number" v-model.number="monthlySalaries[index]" min="0" step="1000"
            @blur="index === 0 ? handleFirstMonthBlur() : null">
          <span>元</span>
        </div>
      </div>

      <div class="form-group">
        <h3>五险一金个人缴纳比例<span class="help-icon" title="根据当地政策设置各项社保和公积金的个人缴纳比例">?</span></h3>
        <table class="base-table">
          <thead>
            <tr>
              <th rowspan="2"></th>
              <th rowspan="2"></th>
              <th colspan="0">1~6月</th>
              <th colspan="0">7~12月</th>
            </tr>
          </thead>
          <tbody>
            <tr>
              <td rowspan="2">社保<br>缴费基数</td>
              <td>下限</td>
              <td><input type="number" v-model.number="insuranceRates.socialMinBase1" min="0" step="100"></td>
              <td><input type="number" v-model.number="insuranceRates.socialMinBase2" min="0" step="100"></td>
            </tr>
            <tr>
              <td>上限</td>
              <td><input type="number" v-model.number="insuranceRates.socialMaxBase1" min="0" step="100"></td>
              <td><input type="number" v-model.number="insuranceRates.socialMaxBase2" min="0" step="100"></td>
            </tr>
            <tr>
              <td rowspan="2">公积金<br>缴费基数</td>
              <td>下限</td>
              <td><input type="number" v-model.number="insuranceRates.housingMinBase1" min="0" step="100"></td>
              <td><input type="number" v-model.number="insuranceRates.housingMinBase2" min="0" step="100"></td>
            </tr>
            <tr>
              <td>上限</td>
              <td><input type="number" v-model.number="insuranceRates.housingMaxBase1" min="0" step="100"></td>
              <td><input type="number" v-model.number="insuranceRates.housingMaxBase2" min="0" step="100"></td>
            </tr>
          </tbody>
        </table>
        <div class="deduction-item">
          <span>养老保险:</span>
          <input type="number" v-model.number="insuranceRates.pensionPercentage" min="0" max="100" step="1">
          <span>%</span>
        </div>
        <div class="deduction-item">
          <span>医疗保险:</span>
          <input type="number" v-model.number="insuranceRates.medicalPercentage" min="0" max="100" step="1">
          <span>%</span>
        </div>
        <div class="deduction-item">
          <span>失业保险:</span>
          <input type="number" v-model.number="insuranceRates.unemploymentPercentage" min="0" max="100" step="0.1">
          <span>%</span>
        </div>
        <div class="deduction-item">
          <span>住房公积金:</span>
          <input type="number" v-model.number="insuranceRates.HousingFundPercentage" min="0" max="100" step="1">
          <span>%</span>
        </div>
        <div class="deduction-item">
          <span>补充公积金:</span>
          <input type="number" v-model.number="insuranceRates.supplementHousingFundPercentage" min="0" max="100"
            step="1">
          <span>%</span>
        </div>
      </div>

      <div class="form-group">
        <h3>专项附加扣除<span class="help-icon" title="根据个人情况填写可享受的专项附加扣除项目">?</span></h3>
        <div class="tax-method">
          <label title="每月由单位在工资中预扣专项附加扣除">
            <input type="radio" v-model="declarationMethod" value="employer"> 通过扣缴义务人申报
          </label>
          <label title="年度汇算清缴时在个人所得税App自行申报扣除">
            <input type="radio" v-model="declarationMethod" value="self"> 综合所得年度自行申报
          </label>
        </div>
        <div class="additional-deduction-item">
          <span title="子女全日制学历教育支出，每月2000元定额扣除">子女教育:</span>
          <input type="number" v-model.number="specialDeductions.childrenEducation" min="0" max="2000" step="100">
          <span>元/月</span>
          <div class="date-range" v-if="specialDeductions.childrenEducation > 0">
            <span>适用月份:</span>
            <select class="month-select" v-model.number="specialDeductionMonths.childrenEducationStart"
              @change="validateMonthRange('childrenEducation')">
              <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
            </select>
            <span>-</span>
            <select class="month-select" v-model.number="specialDeductionMonths.childrenEducationEnd"
              @change="validateMonthRange('childrenEducation')">
              <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
            </select>
            <div class="error-message" v-if="monthRangeErrors.childrenEducation">开始月份不能大于结束月份</div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <span title="首套住房贷款利息支出，每月1000元定额扣除">住房贷款利息:</span>
          <input type="number" v-model.number="specialDeductions.housingLoan" min="0" max="1000" step="100">
          <span>元/月</span>
          <div class="date-range" v-if="specialDeductions.housingLoan > 0">
            <span>适用月份:</span>
            <select class="month-select" v-model.number="specialDeductionMonths.housingLoanStart"
              @change="validateMonthRange('housingLoan')">
              <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
            </select>
            <span>-</span>
            <select class="month-select" v-model.number="specialDeductionMonths.housingLoanEnd"
              @change="validateMonthRange('housingLoan')">
              <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
            </select>
            <div class="error-message" v-if="monthRangeErrors.housingLoan">开始月份不能大于结束月份</div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <span title="工作城市无自有住房租金支出，直辖市/省会1500元/月，其他城市1100或800元/月">住房租金:</span>
          <input type="number" v-model.number="specialDeductions.housingRent" min="0" max="1500" step="100">
          <span>元/月</span>
          <div v-if="specialDeductions.housingRent > 0">
            <div class="date-range">
              <span>适用月份:</span>
              <select class="month-select" v-model.number="specialDeductionMonths.housingRentStart"
                @change="validateMonthRange('housingRent')">
                <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
              </select>
              <span>-</span>
              <select class="month-select" v-model.number="specialDeductionMonths.housingRentEnd"
                @change="validateMonthRange('housingRent')">
                <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
              </select>
              <div class="error-message" v-if="monthRangeErrors.housingRent">开始月份不能大于结束月份</div>
            </div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <span title="赡养60岁以上老人，每月3000元定额扣除">赡养老人:</span>
          <input type="number" v-model.number="specialDeductions.elderlySupport" min="0" max="3000" step="100">
          <span>元/月</span>
          <div class="date-range" v-if="specialDeductions.elderlySupport > 0">
            <span>适用月份:</span>
            <select class="month-select" v-model.number="specialDeductionMonths.elderlySupportStart"
              @change="validateMonthRange('elderlySupport')">
              <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
            </select>
            <span>-</span>
            <select class="month-select" v-model.number="specialDeductionMonths.elderlySupportEnd"
              @change="validateMonthRange('elderlySupport')">
              <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
            </select>
            <div class="error-message" v-if="monthRangeErrors.elderlySupport">开始月份不能大于结束月份</div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <span title="3岁以下婴幼儿照护支出，每月2000元定额扣除">3岁以下婴幼儿照护:</span>
          <input type="number" v-model.number="specialDeductions.infantCare" min="0" max="2000" step="100">
          <span>元/月</span>
          <div class="date-range" v-if="specialDeductions.infantCare > 0">
            <span>适用月份:</span>
            <select class="month-select" v-model.number="specialDeductionMonths.infantCareStart"
              @change="validateMonthRange('infantCare')">
              <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
            </select>
            <span>-</span>
            <select class="month-select" v-model.number="specialDeductionMonths.infantCareEnd"
              @change="validateMonthRange('infantCare')">
              <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
            </select>
            <div class="error-message" v-if="monthRangeErrors.infantCare">开始月份不能大于结束月份</div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <span title="学历继续教育每月400元，不超过48个月，职业资格教育每年3600元定额扣除">继续教育:</span>
          <input type="number" v-model.number="specialDeductions.continuingEducation" min="0" max="400" step="100">
          <span>元/月</span>
          <div class="date-range" v-if="specialDeductions.continuingEducation > 0">
            <span>适用月份:</span>
            <select class="month-select" v-model.number="specialDeductionMonths.continuingEducationStart"
              @change="validateMonthRange('continuingEducation')">
              <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
            </select>
            <span>-</span>
            <select class="month-select" v-model.number="specialDeductionMonths.continuingEducationEnd"
              @change="validateMonthRange('continuingEducation')">
              <option v-for="m in 12" :value="m" :key="m">{{ m }}月</option>
            </select>
            <div class="error-message" v-if="monthRangeErrors.continuingEducation">开始月份不能大于结束月份</div>
          </div>
        </div>
        <div class="additional-deduction-item">
          <span title="医保报销后个人负担超15000元部分，80000元限额内据实扣除">大病医疗:</span>
          <input type="number" v-model.number="specialDeductions.seriousIllness" min="0" max="80000" step="1000">
          <span>元/年</span>
        </div>
      </div>

      <div class="action-buttons">
        <button @click="calculate">计算</button>
      </div>
    </div>

    <div class="result-section" v-if="results">
      <h2>计算结果</h2>
      <table>
        <thead>
          <tr>
            <th rowspan="2">月份</th>
            <th rowspan="2">税前工资</th>
            <th rowspan="2">缴费基数</th>
            <th colspan="4">五险一金</th>
            <th rowspan="2">专项扣除</th>
            <th rowspan="2">累计专项扣除</th>
            <th rowspan="2">累计专项附加扣除</th>
            <th rowspan="2">预扣税率</th>
            <th rowspan="2">应纳税额</th>
            <th rowspan="2">税后工资</th>
          </tr>
          <tr>
            <th>公积金<br>(含补充)</th>
            <th>养老保险</th>
            <th>医疗保险</th>
            <th>失业保险</th>
          </tr>
        </thead>
        <tbody>
          <tr v-for="(result, index) in results.monthlyResults" :key="index">
            <td>{{ index + 1 }}月</td>
            <td>{{ result.grossSalary.toFixed(0) }}</td>
            <td>{{ result.baseAmount.toFixed(0) }}</td>
            <td>{{ (result.insurance?.HousingFundPercentage +
              result.insurance?.supplementHousingFundPercentage).toFixed(0) }}
            </td>
            <td>{{ result.insurance?.pensionPercentage.toFixed(2) }}</td>
            <td>{{ result.insurance?.medicalPercentage.toFixed(2) }}</td>
            <td>{{ result.insurance?.unemploymentPercentage.toFixed(2) }}</td>
            <td>{{ (result.insurance?.HousingFundPercentage + result.insurance?.supplementHousingFundPercentage +
              result.insurance?.pensionPercentage + result.insurance?.medicalPercentage +
              result.insurance?.unemploymentPercentage).toFixed(2) }}</td>
            <td>{{ result.cumulativeDeduction.toFixed(2) }}</td>
            <td>{{ result.cumulativeSpecialDeduction.toFixed(0) }}</td>
            <td>{{ (result.taxRate * 100).toFixed(0) }}%</td>
            <td>{{ result.tax.toFixed(2) }}</td>
            <td>{{ result.netSalary.toFixed(2) }}</td>
          </tr>
        </tbody>
      </table>
    </div>
  </div>
</template>

<script setup lang="ts">
import { ref, watch } from 'vue'
import { calculateMonthlySalary } from '../src/utils/taxCalculator'
import insuranceData from '../src/data/insuranceData.json'

interface CityConfig {
  insuranceRates: {
    pensionPercentage: number
    medicalPercentage: number
    unemploymentPercentage: number
    HousingFundPercentage: number
    supplementHousingFundPercentage: number
  }
  baseConfig: Array<{
    year: number
    periods: Array<{
      startMonth: number
      baseMin: number
      baseMax: number
      housingFundRates?: Array<{
        rate: number
        minBase: number
        maxBase: number
      }>
    }>
  }>
  socialMinBase?: number
  socialMaxBase?: number
  housingMinBase?: number
  housingMaxBase?: number
}

interface Cities {
  [key: string]: CityConfig
}

const cities: Cities = insuranceData.cities as unknown as Cities
const year = ref(2024)
const years = Array.from({ length: 3 }, (_, i) => 2023 + i)
const city = ref('上海')

const monthlySalaries = ref(Array(12).fill(0))

// 1月输入框失去焦点时复制数值到2-12月
function handleFirstMonthBlur() {
  const firstMonthValue = monthlySalaries.value[0]
  if (firstMonthValue > 0) {
    for (let i = 1; i < 12; i++) {
      if (monthlySalaries.value[i] === 0) {
        monthlySalaries.value[i] = firstMonthValue
      }
    }
  }
}
const declarationMethod = ref<'employer' | 'self'>('employer')
const specialDeductions = ref({
  childrenEducation: 0,
  seriousIllness: 0,
  housingLoan: 0,
  housingRent: 0,
  elderlySupport: 0,
  infantCare: 0,
  continuingEducation: 0
})

const specialDeductionMonths = ref({
  childrenEducationStart: 1,
  childrenEducationEnd: 12,
  housingLoanStart: 1,
  housingLoanEnd: 12,
  housingRentStart: 1,
  housingRentEnd: 12,
  elderlySupportStart: 1,
  elderlySupportEnd: 12,
  infantCareStart: 1,
  infantCareEnd: 12,
  continuingEducationStart: 1,
  continuingEducationEnd: 12
})

const monthRangeErrors = ref({
  childrenEducation: false,
  housingLoan: false,
  housingRent: false,
  elderlySupport: false,
  infantCare: false,
  continuingEducation: false
})

const insuranceRates = ref({
  ...cities[city.value].insuranceRates,
  supplementHousingFundPercentage: 0, // 默认0%
  socialMinBase1: cities[city.value].socialMinBase,
  socialMinBase2: cities[city.value].socialMinBase,
  socialMaxBase1: cities[city.value].socialMaxBase,
  socialMaxBase2: cities[city.value].socialMaxBase,
  housingMinBase1: cities[city.value].housingMinBase,
  housingMinBase2: cities[city.value].housingMinBase,
  housingMaxBase1: cities[city.value].housingMaxBase,
  housingMaxBase2: cities[city.value].housingMaxBase
})

// 根据年份和城市更新社保公积金基数
function updateInsuranceBases() {
  const cityData = cities[city.value] as CityConfig
  if (!cityData || !cityData.baseConfig) return

  // 查找匹配年份的配置
  const yearConfig = cityData.baseConfig.find((config) => config.year === year.value)
  if (!yearConfig) return

  // 更新1-6月和7-12月的基数
  const period1 = yearConfig.periods.find((p) => p.startMonth === 1)
  const period2 = yearConfig.periods.find((p) => p.startMonth === 7) || period1

  // 获取当前公积金比例对应的上下限
  const getHousingLimits = (period?: {
    housingFundRates?: Array<{
      rate: number
      minBase: number
      maxBase: number
    }>
  }) => {
    if (!period?.housingFundRates?.length) return { min: 0, max: 0 }
    const rateConfig = period.housingFundRates.find(
      (r) => r.rate === insuranceRates.value.HousingFundPercentage
    )
    return rateConfig ? { min: rateConfig.minBase, max: rateConfig.maxBase } : { min: 0, max: 0 }
  }

  const period1Limits = getHousingLimits(period1)
  const period2Limits = getHousingLimits(period2)

  insuranceRates.value = {
    ...insuranceRates.value,
    socialMinBase1: period1?.baseMin || 0,
    socialMaxBase1: period1?.baseMax || 0,
    housingMinBase1: period1Limits.min,
    housingMaxBase1: period1Limits.max,
    socialMinBase2: period2?.baseMin || 0,
    socialMaxBase2: period2?.baseMax || 0,
    housingMinBase2: period2Limits.min,
    housingMaxBase2: period2Limits.max
  }
}

// 监听公积金比例变化，更新对应的上下限
watch(() => insuranceRates.value.HousingFundPercentage, () => {
  updateInsuranceBases()
})

// 初始化时和year/city变化时更新基数
updateInsuranceBases()
watch([year, city], updateInsuranceBases)

const results = ref<any>(null)

function validateMonthRange(type: string) {
  if (type === 'seriousIllness') return

  const months = specialDeductionMonths.value
  const startKey = `${type}Start` as keyof typeof months
  const endKey = `${type}End` as keyof typeof months

  if (months[startKey] > months[endKey]) {
    monthRangeErrors.value[type as keyof typeof monthRangeErrors.value] = true
    months[endKey] = months[startKey]
  } else {
    monthRangeErrors.value[type as keyof typeof monthRangeErrors.value] = false
  }
}

function calculate() {

  let calculation = null
  try {
    // 调用计算函数
    calculation = calculateMonthlySalary({
      year: year.value,
      city: city.value,
      monthlySalary: monthlySalaries.value,
      insuranceRates: insuranceRates.value,
      specialDeductions: declarationMethod.value === 'employer' ? [{
        ...specialDeductions.value,
        deductionMonths: {
          ...specialDeductionMonths.value
        }
      }] : [],
    })

    results.value = calculation

  } catch (error: unknown) {
    if (error instanceof Error) {
      alert('计算发生错误: ' + error.message);
    } else {
      alert('计算发生未知错误');
    }
  }
}

</script>

<style scoped>
/* 隐藏number输入框的增减按钮 */
input[type="number"]::-webkit-outer-spin-button,
input[type="number"]::-webkit-inner-spin-button {
  -webkit-appearance: none;
  margin: 0;
}

/* 基础样式 */
.calculator-container {
  max-width: 1400px;
  margin: 0 auto;
  padding: 1rem;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 4px 20px rgba(0, 0, 0, 0.08);
}

/* 响应式断点 */
@media (max-width: 1024px) {
  .calculator-container {
    padding: 0.8rem;
  }
}

@media (max-width: 768px) {
  .calculator-container {
    padding: 0.5rem;
    border-radius: 0;
    box-shadow: none;
  }
}

h1 {
  color: #2c3e50;
  text-align: center;
  margin-bottom: 1rem;
  font-weight: 600;
}

.subtitle {
  color: #718096;
  text-align: center;
  margin-bottom: 2rem;
  font-size: 1.1rem;
  font-weight: 400;
}

.top-row {
  display: grid;
  grid-template-columns: 1fr 1fr;
  gap: 1rem;
}

.input-section {
  display: grid;
  grid-template-columns: 1fr 1fr 1fr;
  gap: 1rem;
}

@media (max-width: 1024px) {

  .top-row,
  .input-section {
    gap: 0.8rem;
  }
}

@media (max-width: 768px) {
  .top-row {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }

  .input-section {
    grid-template-columns: 1fr;
    gap: 0.5rem;
  }
}

.form-group {
  margin-bottom: 1rem;
  background: #f8f9fa;
  padding: 1rem;
  border-radius: 8px;
}

@media (max-width: 768px) {
  .form-group {
    padding: 0.8rem;
  }
}

.form-group h3 {
  color: #2c3e50;
  margin-right: 1rem;
  margin-bottom: 1rem;
  font-size: 1.1rem;
  font-weight: 500;
  display: inline-flex;
  align-items: center;
  gap: 4px;
}

.month-select {
  width: 100px;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  transition: all 0.2s;
}


label {
  display: block;
  margin-bottom: 0.5rem;
  color: #4a5568;
  font-weight: 500;
}

select {
  width: 120px;
  /* 增加宽度以提供更多空间 */
  padding: 0.75rem 0.5rem;
  /* 调整左右padding */
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  transition: all 0.2s;
  text-align: center;
  text-align-last: center;
  font-size: 16px;
  -webkit-appearance: none;
  -moz-appearance: none;
  appearance: none;
}

select option {
  text-align: center;
  padding: 0.5rem 0;
  margin: 0 auto;
  display: block;
  text-align: center;
}

/* 为月份选择器添加特定样式 */
.month-select {
  width: 80px;
  padding: 0.75rem 0.25rem;
}

/* 强制下拉面板文本居中 */
select::-ms-expand {
  display: none;
}

select:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

input[type="number"] {
  width: 100px;
  padding: 0.75rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  background: #fff;
  transition: all 0.2s;
  text-align: center;
  font-size: 16px;
}

select:focus,
input[type="number"]:focus {
  outline: none;
  border-color: #4299e1;
  box-shadow: 0 0 0 3px rgba(66, 153, 225, 0.2);
}

.monthly-salary {
  display: grid;
  grid-template-columns: 150px 100px 70px;
  align-items: center;
  gap: 0.5rem;
  margin-bottom: 0.5rem;
}

.monthly-salary span {
  text-align: center;
}

.additional-deduction-item {
  margin-bottom: 1rem;
  display: grid;
  grid-template-columns: 150px auto 1fr;
  align-items: center;
  gap: 0.5rem;
}

.additional-deduction-item input[type="number"] {
  width: 80px;
  margin-right: 0;
}

.additional-deduction-item span:last-child {
  z-index: 1;
  pointer-events: none;
}

.deduction-item {
  margin-bottom: 1rem;
  display: grid;
  grid-template-columns: 150px 110px 40px;
  align-items: center;
  gap: 0.5rem;
}

.deduction-item input[type="number"] {
  width: 80px;
  margin-right: 0;
}

.deduction-item span:last-child {
  z-index: 1;
  pointer-events: none;
}

.base-table {
  width: 100%;
  margin-bottom: 1rem;
  border-collapse: collapse;
}

.base-table th,
.base-table td {
  padding: 0.75rem;
  text-align: center;
}

.base-table td[rowspan="2"] {
  white-space: nowrap;
}

.base-table th {
  background: #2c3e5000;
  color: rgb(0, 0, 0);
  font-weight: 500;
}

.base-table tr:nth-child(even) {
  background: #ffffff00;
}

.base-table input[type="number"] {
  width: 80px;
  padding: 0.5rem;
  border: 1px solid #e2e8f0;
  border-radius: 6px;
  text-align: center;
}

@media (max-width: 768px) {
  .base-table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  .base-table input[type="number"] {
    width: 70px;
  }
}

@media (max-width: 768px) {
  .monthly-salary {
    grid-template-columns: 150px 120px 60px;
    gap: 0.3rem;
  }

  .deduction-item {
    grid-template-columns: 150px 100px 40px;
    gap: 0.3rem;
  }

  .monthly-salary span,
  .deduction-item span {
    text-align: center;
  }
}

.date-range {
  display: grid;
  grid-template-columns: 120px 80px 10px 80px;
  align-items: center;
  gap: 0.5rem;
  margin-top: 0.5rem;
}

.date-range span:first-child {
  margin-left: 30px;
  width: 100px
}

@media (max-width: 768px) {
  .date-range {
    display: grid;
    grid-template-columns: 120px 80px 10px 80px;
    align-items: center;
    gap: 0.5rem;
    margin-top: 0.5rem;
  }

  .date-range span {
    margin-bottom: 0.2rem;
  }
}

.date-range input {
  width: 70px;
}

.action-buttons {
  grid-column: 1 / -1;
  display: flex;
  justify-content: center;
  margin-top: 1rem;
}

button {
  padding: 0.75rem 1.5rem;
  width: 200px;
  background: #4299e1;
  color: white;
  border: none;
  border-radius: 6px;
  font-weight: 500;
  font-size: 1.2rem;
  cursor: pointer;
  transition: all 0.2s;
}

button:hover {
  background: #3182ce;
}

.result-section {
  margin-top: 2rem;
  grid-column: 1 / -1;
}

table {
  width: 100%;
  border-collapse: collapse;
  margin-top: 1rem;
}

@media (max-width: 768px) {
  table {
    display: block;
    overflow-x: auto;
    white-space: nowrap;
  }

  table {
    display: block;
    width: 100%;
    overflow-x: auto;
    -webkit-overflow-scrolling: touch;
  }

  table thead {
    display: table-header-group;
  }

  table tr {
    display: table-row;
  }

  table th,
  table td {
    display: table-cell;
    padding: 0.5rem;
    text-align: center;
  }

  table th {
    background: #2c3e50;
    color: white;
  }
}

th {
  background: #2c3e50;
  color: white;
  padding: 0.75rem;
  text-align: center;
}

td {
  padding: 0.75rem;
  text-align: center;
}

tr:nth-child(even) {
  background: #f8f9fa;
}

.tax-method {
  display: block;
  margin-top: 2rem;
  margin-bottom: 2rem;
}

.tax-method label {
  display: block;
  margin-bottom: 0.5rem;
}

.tax-method label {
  display: flex;
  align-items: center;
  gap: 0.5rem;
  cursor: pointer;
}

.tax-method input[type="radio"] {
  width: auto;
}

.error-message {
  color: #e53e3e;
  font-size: 0.875rem;
  margin-top: 0.25rem;
}

.help-icon {
  display: inline-flex;
  align-items: center;
  justify-content: center;
  width: 12px;
  height: 12px;
  background-color: #4299e1;
  color: white;
  border-radius: 50%;
  font-size: 10px;
  font-weight: bold;
  cursor: help;
  transform: translateY(-4px);
  transition: all 0.2s;
}

.help-icon:hover {
  background-color: #3182ce;
  transform: translateY(-4px) scale(1.1);
}
</style>
