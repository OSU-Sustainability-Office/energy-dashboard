import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/home/index'
import account from '@/components/account/account'
import story from '@/components/story/story'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/account',
      name: 'account',
      component: account
    },
    {
      path: '/story/:id',
      name: 'story',
      props: true,
      component: story
    }
  ]
})
