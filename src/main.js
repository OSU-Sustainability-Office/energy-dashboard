/**
  Filename: main.js
  Info: Entry point for Vue application
*/

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import { createApp } from 'vue'
import App from './App.vue'
import store from './store'
import router from './router'
import ElementPlus from 'element-plus'
import { createI18n } from 'vue-i18n'

const i18n = createI18n({
  locale: 'en',
  messages: {}
})

const app = createApp(App)

app.use(store)
app.use(router)
app.use(ElementPlus)
app.use(i18n)

app.mount('#app')
