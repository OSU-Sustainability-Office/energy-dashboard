// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import { DatePicker } from 'element-ui'
import Vuei18n from 'vue-i18n'
import locale from 'element-ui/lib/locale/lang/en'
import BootstrapVue from 'bootstrap-vue'
import 'bootstrap/dist/css/bootstrap.min.css'
import 'bootstrap-vue/dist/bootstrap-vue.css'
import '@/assets/element-#D73F09/index.css'

Vue.use(BootstrapVue)
Vue.use(Vuei18n)
Vue.use(DatePicker, { locale: locale })

Vue.config.lang = 'en'

/* eslint-disable no-new */
Vue.prototype.$eventHub = new Vue()
Vue.prototype.$globals = {
  signedIn: false,
  userAccount: '',
  userPrivilige: 1
}

var v = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>'
})
Vue.config.devtools = false

window.vue = v
