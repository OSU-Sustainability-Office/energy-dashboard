/**
  Filename: router/index.js
  Info: This is the Vue router component which defines the web-app page routes.
*/

import { createRouter, createWebHashHistory } from 'vue-router'
import view from '@/components/view/view.vue'
import Map from '@/components/map/Map.vue'
import campaigns from '@/components/campaigns/campaign_list.vue'
import GetStarted from '@/components/get_started/GetStarted.vue'
import notfound from '@/components/extras/404.vue'
import contact from '@/components/extras/contact.vue'
import mainCampaignView from '@/components/campaigns/main_campaign_view.vue'
import buildingList from '@/components/building_list/building_list.vue'

const routes = [
  {
    path: '/',
    redirect: '/map'
  },
  {
    path: '/building/:id/:range',
    name: 'building',
    component: view
  },
  {
    path: '/compare/:buildings/:range',
    component: view
  },
  {
    path: '/map',
    component: Map
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
    component: GetStarted
  },
  {
    path: '/contact',
    component: contact
  },
  {
    path: '/:pathMatch(.*)*',
    component: notfound
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
