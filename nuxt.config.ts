// https://nuxt.com/docs/api/configuration/nuxt-config
import tailwindcss from "@tailwindcss/vite";
import pkg from './package.json';

export default defineNuxtConfig({
  compatibilityDate: '2025-05-22',
  devtools: { enabled: false },
  css: ['./src/assets/css/tailwind.css'],

  // SSR must be turned off
  ssr: false,
  srcDir: "src/",

  modules: ['shadcn-nuxt', '@nuxtjs/color-mode'],
  colorMode: {
    classSuffix: ''
  },
  shadcn: {
    /**
     * Prefix for all the imported component
     */
    prefix: '',
    /**
     * Directory that the component lives in.
     * @default "./src/components/ui"
     */
    componentDir: './src/components/ui'
  },
  nitro: {
    preset: 'static',
    compressPublicAssets: false,
    prerender: {
      routes: ['/']
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
  vite: {
    css: {
      devSourcemap: true
    },
    optimizeDeps: {
      exclude: ['@nuxt/nitro']
    },
    build: {
      // css/js compress
      minify: true,
      sourcemap: false,
      rollupOptions: {
        output: {
          sourcemap: false
        }
      }
    },
    plugins: [
      tailwindcss(),
    ],
  },
  app: {
    head: {
      title: pkg.name,
      charset: 'utf-8',
      viewport: 'width=device-width, initial-scale=1.0, shrink-to-fit=no',
      htmlAttrs: {
        lang: 'zh-CN',
      },
      meta: [
        { name: 'keywords', content: pkg.keywords.join(', ') },
        { name: 'description', content: pkg.description }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' },
      ]
    },
    baseURL: './',
    buildAssetsDir: '_nuxt/'
  }
});
