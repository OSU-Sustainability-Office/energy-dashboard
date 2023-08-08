/*
 * @Author: Brogan
 * @Date:   Saturday August 3rd 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Saturday August 3rd 2019
 * @Copyright:  Oregon State University 2019
 */

import API from './api.js'
import Campaign from './campaign.module.js'

const state = () => {
  return {
    promise: null,
    path: 'campaigns'
  }
}

const actions = {
  // Retrieves campaign information for all campaigns from the API and controls the global campaigns promise
  async loadCampaigns ( store ) {
    if ( store.getters.promise === null ) {
      store.commit(
        'promise',
        new Promise( async ( resolve, reject ) => {
          // Attempt to retrieve campaigns from the api
          let campaigns = await API.campaigns()
          campaigns.forEach( c => {
            const campaign = 'campaign_' + c.id.toString()
            const campaignPath = store.getters.path + '/' + campaign

            this.registerModule( campaignPath.split( '/' ), Campaign )
            // console.log(c, 'REGISTERED')
            // store.dispatch(campaign + '/buildBlocks', c.meterGroupIDs) // Create the graph blocks for this campaign
            store.commit( campaign + '/meterGroupIds', c.meterGroupIDs )
            store.commit( campaign + '/path', campaignPath )
            store.commit( campaign + '/id', c.id )
            store.commit(
              campaign + '/dateStart',
              new Date( c.dateStart ).getTime() - new Date().getTimezoneOffset() * 60 * 1000
            )
            store.commit(
              campaign + '/dateEnd',
              new Date( c.dateEnd ).getTime() - new Date().getTimezoneOffset() * 60 * 1000
            )
            store.commit( campaign + '/compareStart', new Date( c.compareStart ).getTime() )
            store.commit( campaign + '/compareEnd', new Date( c.compareEnd ).getTime() )
            store.commit( campaign + '/media', c.media )
            store.commit( campaign + '/name', c.name )
          } )
          resolve()
        } )
      )
    }
    return store.getters.promise
  }
}

const mutations = {
  promise ( state, promise ) {
    state.promise = promise
  }
}

const getters = {
  promise: state => {
    return state.promise
  },

  path: state => {
    return state.path
  },

  campaigns: state => {
    let campaigns = []
    for ( let key of Object.keys( state ) ) {
      if ( key.search( /campaign_/ ) >= 0 ) {
        campaigns.push( state[key] )
      }
    }
    return campaigns
  },

  campaign: state => id => {
    let campaigns = []
    for ( let key of Object.keys( state ) ) {
      if ( key.search( /campaign_/ ) >= 0 ) {
        campaigns.push( state[key] )
      }
    }
    const index = campaigns.map( o => o.id ).indexOf( parseInt( id ) )
    return campaigns[index]
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
