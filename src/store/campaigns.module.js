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
  // Retrieves campaign information for all campaigns from the API and controls the global campaigns promise
  async loadCampaigns (store, payload) {
    store.commit('promise', new Promise(async (resolve, reject) => {
      // Attempt to retrieve campaigns from the api
      try {
        // Register a VueX campaign module for each campaign.
        // Campaigns are registered under the VueX path campaigns/campaign_1, campaigns/campaign_2, etc, where the integer is the ID of the campaign
        store.state.campaigns.forEach(c => {
          const campaign = 'campaign_' + c.id.toString()
          const campaignPath = store.getters.path + '/' + campaign

          // Create a vueX campaign module in a really verbose way
          this.registerModule(campaignPath.split('/'), Campaign)
          c.buildings.forEach(b => {
            store.commit(campaign + '/addBuildingPromise', store.dispatch(campaign + '/loadBuilding', { buildingID: b }))
          })
          store.dispatch(campaign + '/buildBlocks') // Create the graph blocks for this campaign
          store.commit(campaign + '/path', campaignPath)
          store.commit(campaign + '/id', c.id)
          store.commit(campaign + '/path', campaignPath)
          store.commit(campaign + '/date_start', c.dateStart)
          store.commit(campaign + '/date_end', c.dateEnd)
          store.commit(campaign + '/compare_start', c.compareStart)
          store.commit(campaign + '/compare_end', c.compareEnd)
          store.commit(campaign + '/media', c.media)
          store.commit(campaign + '/meterGroupIDs', c.meterGroupIDs)
        })

        return resolve()
      } catch (error) {
        return reject(error)
      }
    }))
    return store.getters['promise']
  },


  // Retrieves an array of campaign IDs
  async getCampaigns (store, payload) {
    // Don't get the campaigns again if they have already been downloaded.
    if (store.getters['promise'] === null) {
      let campaigns = api.campaigns() // Make async api call
      let completeCampaigns = await campaigns // Wait until the promise resolves before continuing.
      store.dispatch('loadCampaigns')
      completeCampaigns.forEach(c => {
        // Add the campaign to the campaign list
        store.commit('addCampaign', c)
      })
    }
    return Promise.resolve(store.getters['allCampaigns'])
  },

  // Retrieves data for a single campaign, and kicks off the data download process
  async getCampaign(store, campaignID) {
    let c = store.state.campaigns[store.state.campaigns.map(c => c.id).indexOf(campaignID)] // Get the campaign data
    const campaign = 'campaign_' + c.id.toString()
    const campaignPath = store.getters.path + '/' + campaign

    // Create a vueX campaign module in a really verbose way
    this.registerModule(campaignPath.split('/'), Campaign)
    c.buildings.forEach(b => {
      store.dispatch(campaign + '/loadBuilding', { buildingID: b })
    })
    console.log(c)

    store.dispatch(campaign + '/buildBlocks') // Create the graph blocks for this campaign
    store.commit(campaign + '/path', campaignPath)
    store.commit(campaign + '/id', c.id)
    store.commit(campaign + '/path', campaignPath)
    store.commit(campaign + '/date_start', c.dateStart)
    store.commit(campaign + '/date_end', c.dateEnd)
    store.commit(campaign + '/compare_start', c.compareStart)
    store.commit(campaign + '/compare_end', c.compareEnd)
    store.commit(campaign + '/media', c.media)
    store.commit(campaign + '/meterGroupIDs', c.meterGroupIDs)
    return Promise.resolve(store.state[campaign])
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
