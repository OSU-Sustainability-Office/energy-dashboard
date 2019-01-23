/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T10:38:57-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2018-12-24T13:57:44-08:00
 */

import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/home/index'
import account from '@/components/account/account'
import map from '@/components/map/map'
import publicDirectory from '@/components/directory/directoryPublic.vue'
import privateDirectory from '@/components/dashboard/dashboard_main.vue'
import mainCampaignView from '@/components/campaigns/main_campaign_view.vue'

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
    },
    {
      path: '/campaign/:id',
      component: mainCampaignView
    }
  ]
})
