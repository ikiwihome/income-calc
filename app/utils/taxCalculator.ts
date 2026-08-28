import { getPeriodPolicy } from './shanghaiPolicy'

const TAX_BRACKETS = [
  { max: 36000, rate: 0.03, quick: 0 },
  { max: 144000, rate: 0.1, quick: 2520 },
  { max: 300000, rate: 0.2, quick: 16920 },
  { max: 420000, rate: 0.25, quick: 31920 },
  { max: 660000, rate: 0.3, quick: 52920 },
  { max: 960000, rate: 0.35, quick: 85920 },
  { max: Number.POSITIVE_INFINITY, rate: 0.45, quick: 181920 },
] as const

export type ContributionRates = {
  pension: number
  medical: number
  unemployment: number
  housing: number
  supplementalHousing: number
}

export type DeductionKey = 'children' | 'infant' | 'elderly' | 'rent' | 'mortgage' | 'education'

export type DeductionItem = {
  key: DeductionKey
  amount: number
  startMonth: number
  endMonth: number
}

export type CalculatorInput = {
  year: number
  salaries: number[]
  socialBases: [number, number]
  housingBases: [number, number]
  rates: ContributionRates
  deductions: DeductionItem[]
  declarationMethod: 'monthly' | 'annual'
  annualMedicalDeduction: number
  otherMonthlyDeduction: number
}

export type MonthResult = {
  month: number
  gross: number
  socialBase: number
  housingBase: number
  pension: number
  medical: number
  unemployment: number
  housing: number
  supplementalHousing: number
  contributions: number
  specialDeduction: number
  otherDeduction: number
  cumulativeTaxable: number
  taxRate: number
  tax: number
  net: number
}

export type CalculationResult = {
  months: MonthResult[]
  annualGross: number
  annualContributions: number
  annualWithheldTax: number
  annualCashReceived: number
  annualSpecialDeduction: number
  annualSettlementTax: number
  estimatedRefund: number
  finalAnnualIncome: number
}

const cents = (value: number) => Math.round((value + Number.EPSILON) * 100) / 100
const yuan = (value: number) => Math.round(value)
const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max)

function taxFor(taxable: number) {
  if (taxable <= 0) return { amount: 0, rate: 0 }
  const bracket = TAX_BRACKETS.find((item) => taxable <= item.max)!
  return { amount: cents(taxable * bracket.rate - bracket.quick), rate: bracket.rate }
}

function monthlySpecialDeduction(items: DeductionItem[], month: number) {
  return items.reduce((sum, item) => (
    month >= item.startMonth && month <= item.endMonth ? sum + Math.max(0, item.amount) : sum
  ), 0)
}

export function calculateSalary(input: CalculatorInput): CalculationResult {
  const months: MonthResult[] = []
  let cumulativeGross = 0
  let cumulativeContributions = 0
  let cumulativeClaimedSpecial = 0
  let cumulativeOther = 0
  let cumulativeWithheld = 0

  input.salaries.forEach((rawSalary, index) => {
    const month = index + 1
    const gross = cents(Math.max(0, Number(rawSalary) || 0))
    const period = getPeriodPolicy(input.year, month)
    const half = month <= 6 ? 0 : 1
    const socialBase = cents(clamp(input.socialBases[half] || gross, period.socialMin, period.socialMax))
    const housingBase = cents(clamp(input.housingBases[half] || gross, period.housingMin, period.housingMax))

    const pension = cents(socialBase * input.rates.pension / 100)
    const medical = cents(socialBase * input.rates.medical / 100)
    const unemployment = cents(socialBase * input.rates.unemployment / 100)
    // 上海口径：职工与单位公积金月缴额分别计算到元，元以下四舍五入。
    const housing = yuan(housingBase * input.rates.housing / 100)
    const supplementalHousing = yuan(housingBase * input.rates.supplementalHousing / 100)
    const contributions = cents(pension + medical + unemployment + housing + supplementalHousing)
    const specialDeduction = cents(monthlySpecialDeduction(input.deductions, month))
    const claimedSpecial = input.declarationMethod === 'monthly' ? specialDeduction : 0
    const otherDeduction = cents(Math.max(0, input.otherMonthlyDeduction || 0))

    cumulativeGross = cents(cumulativeGross + gross)
    cumulativeContributions = cents(cumulativeContributions + contributions)
    cumulativeClaimedSpecial = cents(cumulativeClaimedSpecial + claimedSpecial)
    cumulativeOther = cents(cumulativeOther + otherDeduction)

    const cumulativeTaxable = cents(Math.max(0,
      cumulativeGross - month * 5000 - cumulativeContributions - cumulativeClaimedSpecial - cumulativeOther,
    ))
    const cumulativeTax = taxFor(cumulativeTaxable)
    const tax = cents(Math.max(0, cumulativeTax.amount - cumulativeWithheld))
    cumulativeWithheld = cents(cumulativeWithheld + tax)

    months.push({
      month, gross, socialBase, housingBase, pension, medical, unemployment, housing,
      supplementalHousing, contributions, specialDeduction, otherDeduction,
      cumulativeTaxable, taxRate: cumulativeTax.rate, tax,
      net: cents(gross - contributions - tax),
    })
  })

  const annualGross = cents(months.reduce((sum, item) => sum + item.gross, 0))
  const annualContributions = cents(months.reduce((sum, item) => sum + item.contributions, 0))
  const annualWithheldTax = cents(months.reduce((sum, item) => sum + item.tax, 0))
  const annualCashReceived = cents(months.reduce((sum, item) => sum + item.net, 0))
  const annualSpecialDeduction = cents(months.reduce((sum, item) => sum + item.specialDeduction, 0))
  const annualOther = cents(months.reduce((sum, item) => sum + item.otherDeduction, 0))
  const settlementTaxable = cents(Math.max(0,
    annualGross - 60000 - annualContributions - annualSpecialDeduction
      - annualOther - Math.max(0, input.annualMedicalDeduction || 0),
  ))
  const annualSettlementTax = taxFor(settlementTaxable).amount
  const estimatedRefund = cents(annualWithheldTax - annualSettlementTax)

  return {
    months,
    annualGross,
    annualContributions,
    annualWithheldTax,
    annualCashReceived,
    annualSpecialDeduction,
    annualSettlementTax,
    estimatedRefund,
    finalAnnualIncome: cents(annualCashReceived + estimatedRefund),
  }
}
