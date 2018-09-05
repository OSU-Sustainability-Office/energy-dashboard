// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import { DatePicker, Select, Option, Input, InputNumber } from 'element-ui'
import Vuei18n from 'vue-i18n'
import locale from 'element-ui/lib/locale/lang/en'
import BootstrapVue from 'bootstrap-vue'
import AsyncComputed from 'vue-async-computed'

import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@/assets/element-#D73F09/index.css'

Vue.use(BootstrapVue)
Vue.use(Vuei18n)
Vue.use(DatePicker, { locale: locale })
Vue.use(Select)
Vue.use(Option)
Vue.use(Input)
Vue.use(InputNumber)
Vue.use(AsyncComputed)

Vue.config.lang = 'en'

/* eslint-disable no-new */
Vue.prototype.$eventHub = new Vue()

var v = new Vue({
  el: '#app',
  router,
  store,
  components: { App },
  template: '<App/>'
})
Vue.config.devtools = true

window.vue = v
