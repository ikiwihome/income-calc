import type { ContributionRates } from './taxCalculator'

export type CityCode = 'shanghai' | 'beijing' | 'guangzhou' | 'hangzhou' | 'shenzhen' | 'nanjing' | 'hefei' | 'wuhu'
export type BaseRange = { min: number, max: number }
export type HalfYearPolicy = {
  months: [number, number]
  pension: BaseRange
  medical: BaseRange
  unemployment: BaseRange
  housing: BaseRange
  provisional?: boolean
}
export type CityYearPolicy = { year: number, label: string, verifiedOn: string, periods: [HalfYearPolicy, HalfYearPolicy] }
export type CityPolicy = {
  code: CityCode
  name: string
  province: string
  rentDeduction: number
  defaults: ContributionRates
  housingRate: [number, number]
  supplementalHousingRate: [number, number]
  years: Record<number, CityYearPolicy>
}

type PeriodTuple = [number, number, number, number, Partial<Pick<HalfYearPolicy, 'pension' | 'medical' | 'unemployment'>>?, boolean?]
const r = (min: number, max: number): BaseRange => ({ min, max })
const p = ([socialMin, socialMax, housingMin, housingMax, overrides = {}, provisional = false]: PeriodTuple): HalfYearPolicy => ({
  months: [1, 6], pension: overrides.pension || r(socialMin, socialMax),
  medical: overrides.medical || r(socialMin, socialMax),
  unemployment: overrides.unemployment || r(socialMin, socialMax),
  housing: r(housingMin, housingMax), provisional,
})
const y = (value: number, first: PeriodTuple, second: PeriodTuple): CityYearPolicy => ({
  year: value, label: `${value} 年政策`, verifiedOn: '2026-08-29',
  periods: [p(first), { ...p(second), months: [7, 12] }],
})
const rates = (housing = 7, unemployment = 0.5, medicalFixed = 0): ContributionRates => ({
  pension: 8, medical: 2, medicalFixed, unemployment, housing, supplementalHousing: 0,
})

export const CITY_POLICIES: Record<CityCode, CityPolicy> = {
  shanghai: { code: 'shanghai', name: '上海', province: '上海', rentDeduction: 1500, defaults: rates(7), housingRate: [5, 7], supplementalHousingRate: [0, 5], years: {
    2023: y(2023, [6520, 34188, 2590, 34188], [7310, 36549, 2590, 36549]),
    2024: y(2024, [7310, 36549, 2590, 36549], [7384, 36921, 2690, 36921]),
    2025: y(2025, [7384, 36921, 2690, 36921], [7460, 37302, 2690, 37302]),
    2026: y(2026, [7460, 37302, 2690, 37302], [7546, 37731, 2740, 37731]),
  } },
  beijing: { code: 'beijing', name: '北京', province: '北京', rentDeduction: 1500, defaults: rates(7, 0.5, 3), housingRate: [5, 12], supplementalHousingRate: [0, 12], years: {
    2023: y(2023, [5869, 31884, 2320, 31884], [6326, 33891, 2320, 33891]),
    2024: y(2024, [6326, 33891, 2420, 33891], [6821, 35283, 2420, 35283]),
    2025: y(2025, [6821, 35283, 2420, 35283], [7162, 35811, 2540, 35811]),
    2026: y(2026, [7162, 35811, 2540, 35811], [7270, 36348, 2540, 36348, {}, true]),
  } },
  guangzhou: { code: 'guangzhou', name: '广州', province: '广东', rentDeduction: 1500, defaults: rates(5, 0.2), housingRate: [5, 12], supplementalHousingRate: [0, 12], years: {
    2023: y(2023, [4588, 24930, 2300, 36072], [5284, 26421, 2300, 38082]),
    2024: y(2024, [5284, 26421, 2300, 38082], [5500, 27501, 2300, 39579]),
    2025: y(2025, [5500, 27501, 2500, 39579], [5510, 27549, 2500, 39828]),
    2026: y(2026, [5510, 27549, 2500, 39828], [5510, 27549, 2500, 39828, {}, true]),
  } },
  hangzhou: { code: 'hangzhou', name: '杭州', province: '浙江', rentDeduction: 1500, defaults: rates(7), housingRate: [5, 12], supplementalHousingRate: [0, 12], years: {
    2023: y(2023, [3957, 22311, 2280, 36675], [4462, 24060, 2490, 38390]),
    2024: y(2024, [4462, 24060, 2490, 38390], [4812, 24930, 2490, 39530]),
    2025: y(2025, [4812, 24930, 2490, 39530], [4986, 25299, 2490, 40694]),
    2026: y(2026, [4986, 25299, 2490, 40694], [4986, 25299, 2490, 40694, {}, true]),
  } },
  shenzhen: { code: 'shenzhen', name: '深圳', province: '广东', rentDeduction: 1500, defaults: rates(5, 0.3), housingRate: [5, 12], supplementalHousingRate: [0, 12], years: {
    2023: y(2023, [2360, 24930, 2360, 38892, { medical: r(7778, 38892), unemployment: r(2360, 38892) }], [2360, 26421, 2360, 41190, { medical: r(7778, 38892), unemployment: r(2360, 41190) }]),
    2024: y(2024, [2360, 26421, 2360, 41190, { medical: r(7778, 38892), unemployment: r(2360, 41190) }], [3523, 27501, 2360, 43659, { medical: r(6475, 32376), unemployment: r(2360, 43659) }]),
    2025: y(2025, [3523, 27501, 2360, 43659, { medical: r(6475, 32376), unemployment: r(2360, 43659) }], [4775, 27549, 2520, 44934, { medical: r(6733, 33666), unemployment: r(2520, 44934) }]),
    2026: y(2026, [4775, 27549, 2520, 44934, { medical: r(6733, 33666), unemployment: r(2520, 44934) }], [4775, 27549, 2520, 44934, { medical: r(6733, 33666), unemployment: r(2520, 44934) }, true]),
  } },
  nanjing: { code: 'nanjing', name: '南京', province: '江苏', rentDeduction: 1500, defaults: rates(8), housingRate: [5, 12], supplementalHousingRate: [0, 12], years: {
    2023: y(2023, [4494, 24042, 2280, 38700], [4494, 24042, 2280, 38700]),
    2024: y(2024, [4879, 24396, 2280, 38700], [4879, 24396, 2490, 39900]),
    2025: y(2025, [4952, 24762, 2490, 39900], [4952, 24762, 2490, 41400]),
    2026: y(2026, [4952, 24762, 2660, 41400], [4952, 24762, 2660, 42400, {}, true]),
  } },
  hefei: { code: 'hefei', name: '合肥', province: '安徽', rentDeduction: 1500, defaults: rates(7), housingRate: [5, 12], supplementalHousingRate: [0, 12], years: {
    2023: y(2023, [4019, 20094, 2060, 28004], [4019, 20094, 2060, 28004]),
    2024: y(2024, [4227, 21133, 2060, 28004], [4227, 21133, 2060, 28004]),
    2025: y(2025, [4311, 21556, 2060, 28004], [4311, 21556, 2320, 29782]),
    2026: y(2026, [4311, 21556, 2320, 29782], [4311, 21556, 2320, 29782, {}, true]),
  } },
  wuhu: { code: 'wuhu', name: '芜湖', province: '安徽', rentDeduction: 1100, defaults: rates(7), housingRate: [5, 12], supplementalHousingRate: [0, 12], years: {
    2023: y(2023, [4019, 20094, 1930, 23460], [4019, 20094, 1930, 23460]),
    2024: y(2024, [4227, 21133, 1930, 25386], [4227, 21133, 1930, 25386]),
    2025: y(2025, [4311, 21556, 1930, 25386], [4311, 21556, 2170, 25992]),
    2026: y(2026, [4311, 21556, 2170, 25992], [4311, 21556, 2170, 25992, {}, true]),
  } },
}

export const CITY_OPTIONS = Object.values(CITY_POLICIES)
export const SUPPORTED_YEARS = [2023, 2024, 2025, 2026] as const

export const getCityPolicy = (city: CityCode, policyYear: number) => {
  const policy = CITY_POLICIES[city]?.years[policyYear]
  if (!policy) throw new Error(`暂不支持 ${CITY_POLICIES[city]?.name || city} ${policyYear} 年政策`)
  return policy
}
export const getPeriodPolicy = (city: CityCode, policyYear: number, month: number) => {
  const policy = getCityPolicy(city, policyYear)
  return month <= 6 ? policy.periods[0] : policy.periods[1]
}
export const rangesAreEqual = (item: HalfYearPolicy) => (
  item.medical.min === item.pension.min && item.medical.max === item.pension.max
  && item.unemployment.min === item.pension.min && item.unemployment.max === item.pension.max
)
