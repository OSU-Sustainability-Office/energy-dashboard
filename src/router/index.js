/**
  Filename: router/index.js
  Info: This is the Vue router component which defines the web-app page routes.
*/

import { createRouter, createWebHashHistory } from 'vue-router'

const BuildingView = () => import('@/components/building_view/BuildingView.vue')
const Map = () => import('@/components/map/Map.vue')
const CampaignList = () => import('@/components/campaigns/CampaignList.vue')
const GetStarted = () => import('@/components/get_started/GetStarted.vue')
const NotFound = () => import('@/components/ui/NotFound.vue')
const Contact = () => import('@/components/ui/Contact.vue')
const Campaign = () => import('@/components/campaigns/Campaign.vue')
const BuildingList = () => import('@/components/building_list/BuildingList.vue')

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
