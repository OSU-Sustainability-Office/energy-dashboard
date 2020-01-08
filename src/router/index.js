/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T10:38:57-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-02-04T11:42:51-08:00
 */

import Vue from 'vue'
import Router from 'vue-router'
import index from '@/components/home/index'
import account from '@/components/account/account'
import view from '@/components/view/view'
import map from '@/components/map/map'
import campaigns from '@/components/campaigns/campaign_list'
import publicDirectory from '@/components/directory/directoryPublic.vue'
import privateDirectory from '@/components/dashboard/dashboard_main.vue'
import mainCampaignView from '@/components/campaigns/main_campaign_view.vue'
import buildingList from '@/components/building_list/building_list.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      name: 'index',
      component: index
    },
    {
      path: '/building/:id/:range',
      name: 'building',
      component: view
    },
    {
      path: '/view/:id',
      name: 'private',
      component: account
    },
    {
      path: '/compare/:ids/:range',
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
      component: buildingList
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
    },
    {
      path: '/campaigns',
      component: campaigns
    },
    {
      path: '/buildings',
      component: buildingList
    },
    {
      path: '/buildings/:group',
      component: buildingList
    }
  ]
})
