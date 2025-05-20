// https://nuxt.com/docs/api/configuration/nuxt-config
import { defineNuxtConfig } from 'nuxt/config'

export default defineNuxtConfig({
  // @ts-ignore - site config is valid but not in types
  site: {
    url: 'https://salary.ikimi.cc',
  },
  compatibilityDate: '2025-05-15',
  devtools: { enabled: false },
  modules: [
    '@nuxtjs/robots',
    '@nuxtjs/sitemap'
  ],
  app: {
    head: {
      title: '工资税后收入计算器 - 一个可以精确到分的税后收入计算器',
      meta: [
        { name: 'description', content: '免费在线工资税后收入计算器，精确计算五险一金和个税，实时计算税后到手工资' },
        { name: 'keywords', content: '2025年,最新,精确,工资计算器,税后工资,个税计算,五险一金,社保计算,公积金计算' },
        { property: 'og:type', content: 'website' },
        { property: 'og:title', content: '工资税后收入计算器 - 一个可以精确到分的税后收入计算器' },
        { property: 'og:description', content: '免费在线工资税后收入计算器，精确计算五险一金和个税，实时计算税后到手工资' },
        { property: 'og:url', content: 'https://salary.ikimi.cc' },
        { property: 'og:image', content: 'https://salary.ikimi.cc/og-image.jpg' },
        { name: 'twitter:card', content: 'summary_large_image' }
      ],
      link: [
        { rel: 'canonical', href: 'https://salary.ikimi.cc' }
      ]
    }
  },
  nitro: {
    compressPublicAssets: true,
    prerender: {
      routes: ['/', '/sitemap.xml'],
      crawlLinks: true
    },
    routeRules: {
      '/**': { 
        headers: {
          'X-Frame-Options': 'DENY',
          'X-Content-Type-Options': 'nosniff',
          'Referrer-Policy': 'strict-origin-when-cross-origin',
          'Permissions-Policy': 'geolocation=(), microphone=()'
        }
      }
    }
  },
  // @ts-ignore - sitemap module types
  sitemap: {
    hostname: 'https://salary.ikimi.cc',
    gzip: true,
    exclude: ['/admin/**']
  },
  robots: {
    UserAgent: '*',
    Allow: '/',
    Sitemap: 'https://salary.ikimi.cc/sitemap.xml'
  },
  vite: {
    build: {
      minify: 'terser',
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true
        }
      }
    }
  },
  experimental: {
    payloadExtraction: true
  },
  sourcemap: false
})
