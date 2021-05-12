/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-12-20T10:38:57-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-02-04T11:42:51-08:00
 */

import Vue from 'vue'
import Router from 'vue-router'
import view from '@/components/view/view'
import map from '@/components/map/map'
import campaigns from '@/components/campaigns/campaign_list'
import getStarted from '@/components/get_started/getStartedContent'
import notfound from '@/components/extras/404.vue'
import mainCampaignView from '@/components/campaigns/main_campaign_view.vue'
import buildingList from '@/components/building_list/building_list.vue'
// import admin from '@/components/admin/admin.vue'

Vue.use(Router)

export default new Router({
  routes: [
    {
      path: '/',
      redirect: '/map'
    },
    // {
    //   path: '/admin',
    //   component: admin
    // },
    {
      path: '/dashboard/',
      component: buildingList
    },
    {
      path: '/building/:id/:range',
      name: 'building',
      component: view
    },
    {
      path: '/view/:id',
      component: view
    },
    {
      path: '/compare/:buildings/:range',
      component: view
    },
    {
      path: '/map',
      component: map
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
    },
    {
      path: '/getstarted',
      component: getStarted
    },
    {
      path: '*',
      component: notfound
    }
  ]
})
