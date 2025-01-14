export default {
  // Global page headers: https://v2.nuxt.com/docs/configuration-glossary/configuration-head
  head: {
    title: 'webviewer-nuxtjs-sample',
    htmlAttrs: {
      lang: 'en'
    },
    meta: [
      { charset: 'utf-8' },
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
      { hid: 'description', name: 'description', content: '' },
      { name: 'format-detection', content: 'telephone=no' }
    ],
    link: [
      { rel: 'icon', type: 'image/x-icon', href: '/favicon.ico' }
    ]
  },

  // Global CSS: https://v2.nuxt.com/docs/configuration-glossary/configuration-css/
  css: [
  ],

  // Plugins to run before rendering page: https://v2.nuxt.com/docs/configuration-glossary/configuration-plugins
  plugins: [
  ],

  // Auto import components: https://v2.nuxt.com/docs/configuration-glossary/configuration-components
  components: true,

  // Modules for dev and build (recommended): https://v2.nuxt.com/docs/configuration-glossary/configuration-modules#buildmodules
  buildModules: [
  ],

  // Modules: https://v2.nuxt.com/docs/configuration-glossary/configuration-modules
  modules: [
    // https://nuxt.com/modules/bootstrap
    'bootstrap-vue/nuxt',
    // https://axios.nuxtjs.org/
    '@nuxtjs/axios'
  ],

  // Axios module configuration: https://v2.nuxt.com/examples/modules/axios/
  axios: {
    // Workaround to avoid enforcing hard-coded localhost:3000: https://github.com/nuxt-community/axios-module/issues/308
    baseURL: '/'
  },

  // Bootstrap-Vue module configuration: https://bootstrap-vue.org/docs#nuxtjs-module
  bootstrapVue: {
    bootstrapCSS: true,
    bootstrapVueCSS: true
  },

  // Build Configuration: https://v2.nuxt.com/docs/configuration-glossary/configuration-build/
  build: {
  }
};
