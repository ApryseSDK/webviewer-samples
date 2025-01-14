import Vue from 'vue'
import VueSession from 'vue-session'
//depending on what you need it for
Vue.use(VueSession)
// I needed mine as a component so I did something like this
Vue.component('vue-session', VueSession)