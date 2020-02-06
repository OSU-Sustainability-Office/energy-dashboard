/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */

import api from './api.js'
import Campaign from './campaign.module.js'

const state = () => {
  return {
    promise: null,
    path: 'campaigns',
    campaigns: []
  }
}

const actions = {
  // Retrieves an array of campaigns
  async getCampaigns (store, payload) {

    // Attempt to retrieve campaigns from the api
    try {
      let campaigns = api.campaigns() // Make async api call
      store.commit('promise', campaigns) // Commit a promise to the store, to conform to Brogan's design pattern for VueX
      let completeCampaigns = await campaigns // Wait until the promise resolves before continuing.

      // Register a VueX campaign module for each campaign.
      // Campaigns are registered under the VueX path campaigns/campaign_1, campaigns/campaign_2, etc, where the integer is the ID of the campaign
      completeCampaigns.forEach(c => {
        const campaign = 'campaign_' + c.id.toString()
        const campaignPath = store.getters.path + '/' + campaign

        console.log(Object.keys(c))

        // Create a vueX campaign module in a really verbose way
        this.registerModule(campaignPath.split('/'), Campaign)
        store.commit(campaign + '/path', campaignPath)
        store.commit(campaign + '/id', c.id)
        store.commit(campaign + '/path', campaignPath)
        store.commit(campaign + '/date_start', c.dateStart)
        store.commit(campaign + '/date_end', c.dateEnd)
        store.commit(campaign + '/compare_start', c.compareStart)
        store.commit(campaign + '/compare_end', c.compareEnd)
        store.commit(campaign + '/media', c.media)
      })
      return Promise.resolve(campaigns)
    } catch (error) {
      return Promise.reject(error)
    }
  }

}

const mutations = {
  addCampaign (state, newCampaign) {
    state.campaigns.push(newCampaign)
  },

  promise (state, promise) {
    state.promise = promise
  }
}

const getters = {
  promise (state, promise) {
    return state.promise
  },

  path (state, path) {
    return state.path
  },

  allCampaigns (state, path) {
    return state.campaigns
  }

}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
