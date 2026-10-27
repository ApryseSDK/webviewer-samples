// https://nuxt.com/docs/api/configuration/nuxt-config
export default defineNuxtConfig({
  compatibilityDate: '2026-10-20',

  runtimeConfig: {
    public: {
      // Set at runtime from the NUXT_PUBLIC_DEMO_KEY environment variable.
      demoKey: ''
    }
  },

  // Global page headers: https://nuxt.com/docs/getting-started/seo-meta
  app: {
    head: {
      title: 'webviewer-nuxtjs-sample',
      htmlAttrs: {
        lang: 'en'
      },
      meta: [
        { charset: 'utf-8' },
        { name: 'viewport', content: 'width=device-width, initial-scale=1' },
        { name: 'description', content: '' },
        { name: 'format-detection', content: 'telephone=no' }
      ],
      link: [
        { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
      ]
    }
  }
});
