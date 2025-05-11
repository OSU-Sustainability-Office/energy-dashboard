/**
  Filename: router/index.js
  Info: This is the Vue router component which defines the web-app page routes.
*/

import { createRouter, createWebHashHistory } from 'vue-router'
import BuildingView from '@/components/building_view/BuildingView.vue'
import Map from '@/components/map/Map.vue'
import CampaignList from '@/components/campaigns/CampaignList.vue'
import GetStarted from '@/components/get_started/GetStarted.vue'
import NotFound from '@/components/ui/NotFound.vue'
import Contact from '@/components/ui/Contact.vue'
import Campaign from '@/components/campaigns/Campaign.vue'
import BuildingList from '@/components/building_list/BuildingList.vue'

const routes = [
  {
    path: '/',
    redirect: '/map'
  },
  {
    path: '/building/:id/:range',
    name: 'building',
    component: BuildingView
  },
  {
    path: '/compare/:buildings/:range',
    component: BuildingView
  },
  {
    path: '/map',
    component: Map
  },
  {
    path: '/campaign/:id',
    component: Campaign
  },
  {
    path: '/campaigns',
    component: CampaignList
  },
  {
    path: '/buildings',
    component: BuildingList
  },
  {
    path: '/buildings/:group',
    component: BuildingList
  },
  {
    path: '/getstarted',
    component: GetStarted
  },
  {
    path: '/contact',
    component: Contact
  },
  {
    path: '/:pathMatch(.*)*',
    component: NotFound
  }
]

const router = createRouter({
  history: createWebHashHistory(),
  routes
})

export default router
