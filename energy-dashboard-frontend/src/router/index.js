import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/home/index'
import account from '@/components/account/account'
// import story from '@/components/story/story'
// import admin from '@/components/admin/admin'
import map from '@/components/map/map'
import directory from '@/components/directory/directory'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/dashboard/',
      name: 'dashboard',
      component: account
    },
    {
      path: '/dashboard/:id',
      name: 'account',
      component: account
    },
    {
      path: '/public/:id/:range',
      name: 'public',
      component: account
    },
    {
      path: '/map',
      name: 'map',
      component: map
    },
    {
      path: '/directory',
      name: 'directory',
      component: directory
    },
    {
      path: '/directory/public/',
      component: directory
    },
    {
      path: '/directory/private/',
      component: directory
    },
    {
      path: '/directory/public/:group',
      component: directory
    },
    {
      path: '/directory/private/:group',
      component: directory
    }
  ]
})
