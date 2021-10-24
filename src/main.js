/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2019-01-04T10:08:23-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Milan
 * @Last modified time: 2019-01-31T12:58:55-08:00
 */

// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import Vuex from 'vuex'
import App from './App'
import router from './router'
import StoreConfig from './store'
import elm from 'element-ui'
import Vuei18n from 'vue-i18n'
import locale from 'element-ui/lib/locale/lang/en'
import AsyncComputed from 'vue-async-computed'
import 'element-ui/lib/theme-chalk/reset.css'
import '@/assets/style-variables.scss'

// Link Vue Instance w/ Vuex Interface
Vue.use(Vuex)
// Compatibility stuff for Element UI
Vue.use(Vuei18n)
Vue.use(elm, { locale: locale })
Vue.use(AsyncComputed)

// Should probably offload this to a .env
Vue.config.debug = false
Vue.config.devtools = false
Vue.config.lang = 'en'

/* eslint-disable no-new */
var v = new Vue({
  el: '#app',
  router,
  store: new Vuex.Store(StoreConfig),
  render: h => h(App)
})
window.vue = v
