export type HalfYearPolicy = {
  months: [number, number]
  socialMin: number
  socialMax: number
  housingMin: number
  housingMax: number
}

export type ShanghaiPolicy = {
  year: number
  label: string
  verifiedOn: string
  periods: [HalfYearPolicy, HalfYearPolicy]
}

export const SHANGHAI_POLICIES: Record<number, ShanghaiPolicy> = {
  2023: {
    year: 2023, label: '2023 年政策', verifiedOn: '2026-08-28',
    periods: [
      { months: [1, 6], socialMin: 6520, socialMax: 34188, housingMin: 2590, housingMax: 34188 },
      { months: [7, 12], socialMin: 7310, socialMax: 36549, housingMin: 2590, housingMax: 36549 },
    ],
  },
  2024: {
    year: 2024, label: '2024 年政策', verifiedOn: '2026-08-28',
    periods: [
      { months: [1, 6], socialMin: 7310, socialMax: 36549, housingMin: 2590, housingMax: 36549 },
      { months: [7, 12], socialMin: 7384, socialMax: 36921, housingMin: 2690, housingMax: 36921 },
    ],
  },
  2025: {
    year: 2025, label: '2025 年政策', verifiedOn: '2026-08-28',
    periods: [
      { months: [1, 6], socialMin: 7384, socialMax: 36921, housingMin: 2690, housingMax: 36921 },
      { months: [7, 12], socialMin: 7460, socialMax: 37302, housingMin: 2690, housingMax: 37302 },
    ],
  },
  2026: {
    year: 2026, label: '2026 年政策', verifiedOn: '2026-08-28',
    periods: [
      { months: [1, 6], socialMin: 7460, socialMax: 37302, housingMin: 2690, housingMax: 37302 },
      { months: [7, 12], socialMin: 7546, socialMax: 37731, housingMin: 2740, housingMax: 37731 },
    ],
  },
}

export function getPeriodPolicy(year: number, month: number) {
  const policy = SHANGHAI_POLICIES[year]
  if (!policy) throw new Error(`暂不支持 ${year} 年政策`)
  return month <= 6 ? policy.periods[0] : policy.periods[1]
}
