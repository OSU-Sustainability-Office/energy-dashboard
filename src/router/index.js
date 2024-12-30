/**
  Filename: router/index.js
  Info: This is the Vue router component which defines the web-app page routes.
*/

import { createRouter, createWebHistory } from 'vue-router'
import view from '@/components/view/view.vue'
import map from '@/components/map/map.vue'
import campaigns from '@/components/campaigns/campaign_list.vue'
import getStarted from '@/components/get_started/getStartedContent.vue'
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
    path: '/contact',
    component: contact
  },
  {
    path: '/:pathMatch(.*)*',
    component: notfound
  }
]

const router = createRouter({
  history: createWebHistory(),
  routes
})

export default router
