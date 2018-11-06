import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/home/index'
import account from '@/components/account/account'
import map from '@/components/map/map'
import publicDirectory from '@/components/directory/directoryPublic.vue'
import privateDirectory from '@/components/directory/directoryPrivate.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/public/:id/:range',
      name: 'public',
      component: account
    },
    {
      path: '/story/:id',
      name: 'private',
      component: account
    },
    {
      path: '/map',
      name: 'map',
      component: map
    },
    {
      path: '/buildingList/',
      component: publicDirectory
    },
    {
      path: '/dashboard/',
      component: privateDirectory
    },
    {
      path: '/buildingList/:group',
      component: publicDirectory
    },
    {
      path: '/dashboard/:group',
      component: privateDirectory
    }
  ]
})
