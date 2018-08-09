// The Vue build version to load with the `import` command
// (runtime-only or standalone) has been set in webpack.base.conf with an alias.
import Vue from 'vue'
import App from './App'
import router from './router'
import 'bootstrap'
import 'bootstrap/dist/css/bootstrap.min.css'
import * as uiv from 'uiv'



Vue.use(uiv)

/* eslint-disable no-new */
Vue.prototype.$eventHub = new Vue();
Vue.prototype.$globals = {
  signedIn : false,
  userAccount: "",
  userPrivilige: 1
}

var v = new Vue({
  el: '#app',
  router,
  components: { App },
  template: '<App/>',
})
Vue.config.devtools = false

window.vue = v;
