import { computed, reactive, ref, watch } from 'vue'
import { calculateSalary, type DeductionItem, type DeductionKey } from '@/utils/taxCalculator'
import { CITY_OPTIONS, CITY_POLICIES, getCityPolicy, SUPPORTED_YEARS, type CityCode } from '@/utils/cityPolicies'
import { exportSalaryWorkbook } from '@/utils/exportSalaryWorkbook'

const baseDeductionCatalog: Array<{
  key: DeductionKey
  name: string
  defaultAmount: number
  max: number
  hint: string
}> = [
  { key: 'children', name: '子女教育', defaultAmount: 2000, max: 20000, hint: '每名子女 2,000 元/月，可由一方全额或双方各 50%' },
  { key: 'infant', name: '3 岁以下婴幼儿照护', defaultAmount: 2000, max: 20000, hint: '每名婴幼儿 2,000 元/月' },
  { key: 'elderly', name: '赡养老人', defaultAmount: 3000, max: 3000, hint: '独生子女 3,000 元/月；非独生子女本人不超过 1,500 元/月' },
  { key: 'rent', name: '住房租金', defaultAmount: 1500, max: 1500, hint: '按主要工作城市适用额度，与住房贷款利息不可同时享受' },
  { key: 'mortgage', name: '住房贷款利息', defaultAmount: 1000, max: 1000, hint: '首套住房贷款 1,000 元/月，最长 240 个月' },
  { key: 'education', name: '学历继续教育', defaultAmount: 400, max: 400, hint: '400 元/月，同一学历最长 48 个月' },
]

export function useSalaryCalculator() {
  const currentStep = ref(0)
  const salaryMode = ref<'same' | 'monthly'>('same')
  const showAdvancedRates = ref(true)
  const showFormula = ref<number | null>(null)
  const exportingExcel = ref(false)
  const state = reactive({
    city: 'shanghai' as CityCode,
    year: 2026,
    baseSalary: 20000,
    salaries: Array(12).fill(20000) as number[],
    socialBases: [20000, 20000] as [number, number],
    housingBases: [20000, 20000] as [number, number],
    rates: { ...CITY_POLICIES.shanghai.defaults },
    declarationMethod: 'monthly' as 'monthly' | 'annual',
    annualMedicalDeduction: 0,
    otherMonthlyDeduction: 0,
    deductions: Object.fromEntries(baseDeductionCatalog.map((item) => [item.key, {
      enabled: false, amount: item.defaultAmount, startMonth: 1, endMonth: 12,
    }])) as Record<DeductionKey, { enabled: boolean, amount: number, startMonth: number, endMonth: number }>,
  })

  watch(() => state.baseSalary, (salary, previousSalary) => {
    if (salaryMode.value === 'same') state.salaries = Array(12).fill(Math.max(0, Number(salary) || 0))
    const nextBase = Math.max(0, Number(salary) || 0)
    const previousBase = Number(previousSalary) || 0
    state.socialBases = state.socialBases.map((value) => value === previousBase ? nextBase : value) as [number, number]
    state.housingBases = state.housingBases.map((value) => value === previousBase ? nextBase : value) as [number, number]
  })

  watch(salaryMode, (mode) => {
    if (mode === 'same') state.salaries = Array(12).fill(Math.max(0, Number(state.baseSalary) || 0))
  })

  const cityPolicy = computed(() => CITY_POLICIES[state.city])
  const policy = computed(() => getCityPolicy(state.city, state.year))
  const supplementalHousingMax = computed(() => state.city === 'shanghai'
    ? cityPolicy.value.supplementalHousingRate[1]
    : Math.max(0, 12 - (Number(state.rates.housing) || 0)))
  const supplementalHousingHint = computed(() => {
    if (state.city === 'shanghai') return '上海正式补充住房公积金：单位与个人各缴 1%–5%，没有时填 0'
    if (supplementalHousingMax.value === 0) return '当前普通公积金已达 12%；如单位拆分缴存，请先降低普通公积金比例'
    if (state.city === 'wuhu' && state.year >= 2024) return `芜湖按单位实际约定填写，当前最多可补充 ${supplementalHousingMax.value}%`
    return '按单位实际执行的额外个人缴存填写；普通与补充个人缴存合计不超过 12%，没有时填 0'
  })
  const deductionCatalog = computed(() => baseDeductionCatalog.map((item) => item.key === 'rent' ? {
    ...item,
    name: `住房租金（${cityPolicy.value.name}）`,
    defaultAmount: cityPolicy.value.rentDeduction,
    max: cityPolicy.value.rentDeduction,
    hint: `${cityPolicy.value.name}适用 ${cityPolicy.value.rentDeduction.toLocaleString('zh-CN')} 元/月，与住房贷款利息不可同时享受`,
  } : item))
  const enabledDeductions = computed<DeductionItem[]>(() => deductionCatalog.value
    .filter((item) => state.deductions[item.key].enabled)
    .map((item) => ({ key: item.key, ...state.deductions[item.key] })))
  const result = computed(() => calculateSalary({
    city: state.city,
    year: state.year,
    salaries: state.salaries,
    socialBases: state.socialBases,
    housingBases: state.housingBases,
    rates: state.rates,
    deductions: enabledDeductions.value,
    declarationMethod: state.declarationMethod,
    annualMedicalDeduction: state.annualMedicalDeduction,
    otherMonthlyDeduction: state.otherMonthlyDeduction,
  }))
  const averageMonthlyNet = computed(() => result.value.annualCashReceived / 12)
  const averageMonthlyFinalIncome = computed(() => result.value.finalAnnualIncome / 12)
  const averageContributions = computed(() => ({
    pension: result.value.months.reduce((sum, month) => sum + month.pension, 0) / 12,
    medical: result.value.months.reduce((sum, month) => sum + month.medical, 0) / 12,
    unemployment: result.value.months.reduce((sum, month) => sum + month.unemployment, 0) / 12,
    housing: result.value.months.reduce((sum, month) => sum + month.housing, 0) / 12,
    supplementalHousing: result.value.months.reduce((sum, month) => sum + month.supplementalHousing, 0) / 12,
  }))
  const progress = computed(() => `${(currentStep.value / 3) * 100}%`)
  const canContinue = computed(() => state.salaries.some((salary) => Number(salary) > 0))

  const money = (value: number, digits = 2) => new Intl.NumberFormat('zh-CN', {
    minimumFractionDigits: digits,
    maximumFractionDigits: digits,
  }).format(Number(value) || 0)

  const setYear = (year: number) => { state.year = Number(year) }
  const setCity = (city: CityCode) => {
    state.city = city
    Object.assign(state.rates, CITY_POLICIES[city].defaults)
    const rent = state.deductions.rent
    if (!rent.enabled || rent.amount > CITY_POLICIES[city].rentDeduction) rent.amount = CITY_POLICIES[city].rentDeduction
  }
  const toggleDeduction = (key: DeductionKey) => {
    const target = state.deductions[key]
    target.enabled = !target.enabled
    if (key === 'rent' && target.enabled) state.deductions.mortgage.enabled = false
    if (key === 'mortgage' && target.enabled) state.deductions.rent.enabled = false
  }
  watch(supplementalHousingMax, (maximum) => {
    state.rates.supplementalHousing = Math.min(
      Math.max(0, Number(state.rates.supplementalHousing) || 0),
      maximum,
    )
  })
  watch(() => state.rates.supplementalHousing, (rate) => {
    const normalized = Math.min(Math.max(0, Number(rate) || 0), supplementalHousingMax.value)
    if (normalized !== rate) state.rates.supplementalHousing = normalized
  })
  const next = () => {
    if (currentStep.value < 3 && canContinue.value) {
      currentStep.value += 1
      window.scrollTo({ top: 0, behavior: 'smooth' })
    }
  }
  const previous = () => { if (currentStep.value > 0) currentStep.value -= 1 }
  const editStep = (step: number) => { currentStep.value = step }
  const exportExcel = async () => {
    exportingExcel.value = true
    try {
      await exportSalaryWorkbook({
        cityName: cityPolicy.value.name,
        year: state.year,
        result: result.value,
        averageMonthlyNet: averageMonthlyNet.value,
        rates: state.rates,
        policy: policy.value,
      })
    } finally {
      exportingExcel.value = false
    }
  }

  return {
    currentStep, salaryMode, showAdvancedRates, showFormula, exportingExcel, state,
    cityPolicy, policy, deductionCatalog, supplementalHousingMax, supplementalHousingHint,
    result, averageMonthlyNet, averageMonthlyFinalIncome, averageContributions,
    progress, canContinue, money, setYear, setCity, toggleDeduction, next, previous, editStep, exportExcel,
    cityOptions: CITY_OPTIONS, supportedYears: SUPPORTED_YEARS,
  }
}
