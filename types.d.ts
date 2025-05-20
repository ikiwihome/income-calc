// Vue和Nuxt类型声明
declare module 'vue' {
  export * from '@vue/runtime-core'
  export interface GlobalComponents {}
}

declare module 'nuxt' {
  export function defineNuxtConfig(config: any): any
}

declare module '*.vue' {
  import { DefineComponent } from 'vue'
  const component: DefineComponent<{}, {}, any>
  export default component
}

// Unhead类型声明
declare module '@unhead/vue' {
  import { MaybeComputedRef } from '@unhead/schema'
  import { Head } from '@unhead/schema'
  
  export function useHead<T extends Head>(input: MaybeComputedRef<T>): void
  export function useHead(input: Head): void
}

// 自定义模块类型声明
declare module '~/utils/taxCalculator' {
  export function calculateMonthlySalary(params: {
    year: number
    city: string
    monthlySalary: number[]
    insuranceRates: any
    specialDeductions: any[]
    bonus?: number
    bonusTaxMethod?: 'separate' | 'combined'
  }): any
}

declare module '~/data/insuranceData.json' {
  const data: {
    cities: Record<string, any>
  }
  export default data
}
