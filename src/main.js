<<<<<<< HEAD
/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-01-04T10:08:23-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-01-04T11:46:27-08:00
 */

=======
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import store from './store'
import elm from 'element-ui'
import Vuei18n from 'vue-i18n'
import locale from 'element-ui/lib/locale/lang/en'
// import BootstrapVue from 'bootstrap-vue'
import AsyncComputed from 'vue-async-computed'
import 'element-ui/lib/theme-chalk/reset.css'
// import 'bootstrap/dist/css/bootstrap.min.css'
// import 'bootstrap-vue/dist/bootstrap-vue.css'
// import '@/assets/element-#D73F09/index.css'
// import 'element-ui/lib/theme-chalk/index.css'
import '@/assets/style-variables.scss'

// Vue.use(BootstrapVue)
Vue.use(Vuei18n)
Vue.use(elm, { locale: locale })
Vue.use(AsyncComputed)

Vue.config.lang = 'en'

/* eslint-disable no-new */
Vue.prototype.$eventHub = new Vue()

var v = new Vue({
  el: '#app',
  router,
  store,
  render: h => h(App)
})
Vue.config.devtools = true

window.vue = v
