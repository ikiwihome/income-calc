/**
 * 工资税后收入计算器
 */

// 个人所得税税率表
const TAX_RATES = [
  { min: 0, max: 36000, rate: 0.03, deduction: 0 },
  { min: 36000, max: 144000, rate: 0.1, deduction: 2520 },
  { min: 144000, max: 300000, rate: 0.2, deduction: 16920 },
  { min: 300000, max: 420000, rate: 0.25, deduction: 31920 },
  { min: 420000, max: 660000, rate: 0.3, deduction: 52920 },
  { min: 660000, max: 960000, rate: 0.35, deduction: 85920 },
  { min: 960000, max: Infinity, rate: 0.45, deduction: 181920 }
]

// 五险一金比例配置
interface InsuranceRates {
  pensionPercentage: number // 养老保险
  medicalPercentage: number // 医疗保险
  unemploymentPercentage: number // 失业保险
  HousingFundPercentage: number // 住房公积金
  supplementHousingFundPercentage?: number // 补充住房公积金
}

// 专项附加扣除配置
interface SpecialDeduction {
  childrenEducation?: number // 子女教育
  seriousIllness?: number // 大病医疗
  housingLoan?: number // 住房贷款利息
  housingRent?: number // 住房租金
  elderlySupport?: number // 赡养老人
  infantCare?: number // 3岁以下婴幼儿照护
  continuingEducation?: number // 继续教育
  deductionMonths?: {
    childrenEducationStart?: number
    childrenEducationEnd?: number
    seriousIllnessStart?: number
    seriousIllnessEnd?: number
    housingLoanStart?: number
    housingLoanEnd?: number
    housingRentStart?: number
    housingRentEnd?: number
    housingRentTier?: string
    elderlySupportStart?: number
    elderlySupportEnd?: number
    infantCareStart?: number
    infantCareEnd?: number
    continuingEducationStart?: number
    continuingEducationEnd?: number
  }
}

// 社保基数配置
interface SocialInsuranceBase {
  year: number
  city: string
  baseMin: number // 基数下限
  baseMax: number // 基数上限
}

/**
 * 计算五险一金个人缴纳部分
 * @param salary 税前工资
 * @param rates 五险一金比例
 * @param base 社保基数
 */
function calculateInsurance(salary: number, rates: InsuranceRates, base: SocialInsuranceBase & { housingFundRates?: Array<{ rate: number, minBase: number, maxBase: number }> }) {
  const baseAmount = Math.min(Math.max(salary, base.baseMin), base.baseMax)

  // 获取当前缴存比例对应的公积金上下限
  let housingMin = 0
  let housingMax = 0
  if (base.housingFundRates) {
    const rateConfig = base.housingFundRates.find(r => r.rate === rates.HousingFundPercentage)
    if (rateConfig) {
      housingMin = rateConfig.minBase
      housingMax = rateConfig.maxBase
    }
  }

  // 计算公积金金额，确保在上下限范围内
  const housingFundAmount = Math.min(
    Math.max(
      Math.floor(baseAmount * rates.HousingFundPercentage / 100),
      housingMin
    ),
    housingMax
  )

  return {
    pensionPercentage: baseAmount * rates.pensionPercentage / 100,
    medicalPercentage: baseAmount * rates.medicalPercentage / 100,
    unemploymentPercentage: baseAmount * rates.unemploymentPercentage / 100,
    HousingFundPercentage: housingFundAmount,
    supplementHousingFundPercentage: rates.supplementHousingFundPercentage ? Math.floor(baseAmount * rates.supplementHousingFundPercentage / 100) : 0
  }
}

/**
 * 计算个人所得税
 * @param taxableIncome 应纳税所得额
 */
function calculateIncomeTax(taxableIncome: number) {
  for (const bracket of TAX_RATES) {
    if (taxableIncome > bracket.min && taxableIncome <= bracket.max) {
      return taxableIncome * bracket.rate - bracket.deduction
    }
  }
  return 0
}

/**
 * 计算月度税后工资
 * @param params 计算参数
 */
export function calculateMonthlySalary(params: {
  year: number
  city: string
  monthlySalary: number[]
  insuranceRates: InsuranceRates
  specialDeductions: SpecialDeduction[]
}) {
  const monthlyResults: Array<{
    grossSalary: number
    baseAmount: number
    insurance: {
      pensionPercentage: number
      medicalPercentage: number
      unemploymentPercentage: number
      HousingFundPercentage: number
      supplementHousingFundPercentage: number
    }
    specialDeduction: number
    cumulativeSpecialDeduction: number
    cumulativeDeduction: number
    taxableIncome: number
    taxRate: number
    tax: number
    netSalary: number
  }> = []

  let cumulativeIncome = 0 // 累计收入
  let cumulativeDeduction = 0 // 累计专项扣除
  let cumulativeSpecialDeduction = 0 // 累计专项附加扣除
  let cumulativeTax = 0 // 累计已缴税额
  let seriousIllnessDeduction = 0 // 大病医疗累计扣除

  // 计算每月数据
  for (let i = 0; i < params.monthlySalary.length; i++) {
    const month = i + 1
    const grossSalary = params.monthlySalary[i]
    if (!grossSalary) continue

    // 计算五险一金
    const base = getSocialInsuranceBase(params.year, params.city, month)
    const insurance = calculateInsurance(grossSalary, params.insuranceRates, base)
    const totalInsurance = parseFloat(Object.values(insurance).reduce((sum, val) => sum + val, 0).toFixed(2))

    // 计算专项附加扣除
    const specialDeduction = calculateSpecialDeduction(params.specialDeductions, month)

    // 累计计算
    cumulativeIncome += grossSalary
    cumulativeDeduction += totalInsurance
    cumulativeSpecialDeduction += specialDeduction

    // 应纳税所得额
    const taxableIncome = cumulativeIncome - cumulativeDeduction - (5000 * month) - cumulativeSpecialDeduction

    // 计算累计应纳税额
    const cumulativeTaxAmount = calculateIncomeTax(taxableIncome)

    // 计算本月应纳税额（累计税额减去上月累计税额）
    let currentMonthTax = 0
    if (month === 1) {
      currentMonthTax = cumulativeTaxAmount
    } else {
      // 重新计算上月累计应纳税所得额
      const lastMonthTaxableIncome = (cumulativeIncome - grossSalary) -
        (cumulativeDeduction - totalInsurance) -
        (5000 * (month - 1)) -
        (cumulativeSpecialDeduction - specialDeduction)
      const lastMonthCumulativeTax = calculateIncomeTax(lastMonthTaxableIncome)
      currentMonthTax = cumulativeTaxAmount - lastMonthCumulativeTax
    }
    cumulativeTax = cumulativeTaxAmount

    // 税后工资
    const netSalary = grossSalary - totalInsurance - currentMonthTax

    // 计算当前税率
    let currentMonthTaxRate = 0
    for (const bracket of TAX_RATES) {
      if (taxableIncome > bracket.min && taxableIncome <= bracket.max) {
        currentMonthTaxRate = bracket.rate
        break
      }
    }

    monthlyResults.push({
      grossSalary: Math.round(grossSalary),
      baseAmount: Math.round(Math.min(Math.max(grossSalary, base.baseMin), base.baseMax)),
      insurance: insurance, // 返回完整的insurance对象
      specialDeduction: parseFloat(specialDeduction.toFixed(2)), // 当月专项附加扣除
      cumulativeSpecialDeduction: Math.round(cumulativeSpecialDeduction), // 累计专项附加扣除
      cumulativeDeduction: parseFloat(cumulativeDeduction.toFixed(2)),
      taxableIncome: parseFloat(taxableIncome.toFixed(2)),
      taxRate: currentMonthTaxRate,
      tax: parseFloat(currentMonthTax.toFixed(2)),
      netSalary: parseFloat(netSalary.toFixed(2))
    })
  }

  // 年度汇总
  const annualTax = monthlyResults.reduce((sum, month) => sum + month.tax, 0)
  const annualNetSalary = monthlyResults.reduce((sum, month) => sum + month.netSalary, 0)

  return {
    monthlyResults,
    annualTax: parseFloat(annualTax.toFixed(2)),
    annualNetSalary: parseFloat(annualNetSalary.toFixed(2))
  }
}

/**
 * 计算专项附加扣除
 */
function calculateSpecialDeduction(deductions: SpecialDeduction[], month: number): number {
  let total = 0
  for (const deduction of deductions) {
    const months = deduction.deductionMonths || {}

    // 检查各项扣除是否在有效月份内
    if (deduction.childrenEducation &&
      (!months.childrenEducationStart || month >= months.childrenEducationStart) &&
      (!months.childrenEducationEnd || month <= months.childrenEducationEnd)) {
      total += Math.min(deduction.childrenEducation, 2000) // 子女教育每月最多2000
    }

    if (deduction.housingLoan &&
      (!months.housingLoanStart || month >= months.housingLoanStart) &&
      (!months.housingLoanEnd || month <= months.housingLoanEnd)) {
      total += Math.min(deduction.housingLoan, 1000) // 住房贷款利息每月最多1000
    }

    if (deduction.housingRent &&
      (!months.housingRentStart || month >= months.housingRentStart) &&
      (!months.housingRentEnd || month <= months.housingRentEnd)) {
      total += Math.min(deduction.housingRent, 1500) // 住房租金按城市级别限额
    }

    if (deduction.elderlySupport &&
      (!months.elderlySupportStart || month >= months.elderlySupportStart) &&
      (!months.elderlySupportEnd || month <= months.elderlySupportEnd)) {
      total += Math.min(deduction.elderlySupport, 3000) // 赡养老人每月最多3000
    }

    // 大病医疗按年度累计计算
    if (deduction.seriousIllness &&
      (!months.seriousIllnessStart || month >= months.seriousIllnessStart) &&
      (!months.seriousIllnessEnd || month <= months.seriousIllnessEnd)) {
      const remainingDeduction = Math.max(0, deduction.seriousIllness - 15000) // 超过1.5万部分可扣除
      total += Math.min(remainingDeduction / 12, 2000) // 每月最多扣除2000元
    }

    // 3岁以下婴幼儿照护
    if (deduction.infantCare &&
      (!months.infantCareStart || month >= months.infantCareStart) &&
      (!months.infantCareEnd || month <= months.infantCareEnd)) {
      total += Math.min(deduction.infantCare, 2000) // 每月最多2000元
    }

    // 继续教育
    if (deduction.continuingEducation &&
      (!months.continuingEducationStart || month >= months.continuingEducationStart) &&
      (!months.continuingEducationEnd || month <= months.continuingEducationEnd)) {
      total += Math.min(deduction.continuingEducation, 400) // 每月最多400元
    }
  }
  return total
}

import insuranceData from '@/stores/insuranceData.json'

interface BaseConfig {
  year: number
  periods: Array<{
    startMonth: number
    endMonth: number
    baseMin: number
    baseMax: number
  }>
}

/**
 * 获取社保基数配置
 */
function getSocialInsuranceBase(year: number, city: string, month: number): SocialInsuranceBase & { housingFundRates?: Array<{ rate: number, minBase: number, maxBase: number }> } {
  const cityData = insuranceData.cities[city as keyof typeof insuranceData.cities]
  if (!cityData) {
    throw new Error(`未找到城市 ${city} 的社保配置`)
  }

  // 查找对应年份的配置
  const yearConfig = cityData.baseConfig.find((config: BaseConfig) => config.year === year)
  if (!yearConfig) {
    throw new Error(`未找到 ${year} 年 ${city} 的社保基数配置`)
  }

  // 查找对应月份的基数配置
  for (const period of yearConfig.periods) {
    if (month >= period.startMonth && month <= period.endMonth) {
      return {
        year,
        city,
        baseMin: period.baseMin,
        baseMax: period.baseMax,
        housingFundRates: (period as any).housingFundRates
      }
    }
  }

  throw new Error(`未找到 ${year} 年 ${month} 月 ${city} 的社保基数配置`)
}
