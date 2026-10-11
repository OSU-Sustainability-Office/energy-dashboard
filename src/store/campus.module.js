/*
  Filename: campus.module.js
  Info: Tracks which campus the user is looking at. OSU-Cascades is ~155 km from
        Corvallis, so the map and the buildings list only ever show one of them.
        The choice is remembered across visits; until one is made, the app shows
        the campus picker.
*/

const STORAGE_KEY = 'osu-energy.campus'

export const CAMPUSES = [
  { id: 'corvallis', label: 'Corvallis' },
  { id: 'cascades', label: 'Cascades' }
]

// What a building without a campus is assumed to be. Every building predates the
// Cascades work, so this also keeps the app working if the frontend ships before
// the backend starts sending the field.
export const DEFAULT_CAMPUS = 'corvallis'

const isValid = id => CAMPUSES.some(campus => campus.id === id)

// localStorage throws when site data is blocked and is absent in some test
// environments, so every access is guarded. Failing to remember the choice is a
// lost convenience, never a reason to stop the dashboard working.
const readStored = () => {
  try {
    const stored = window.localStorage.getItem(STORAGE_KEY)
    return isValid(stored) ? stored : null
  } catch (err) {
    return null
  }
}

const writeStored = id => {
  try {
    window.localStorage.setItem(STORAGE_KEY, id)
  } catch (err) {
    /* see above */
  }
}

const state = () => {
  return {
    active: null // null until the user picks, which is what opens the picker
  }
}

const actions = {
  restore(store) {
    const stored = readStored()
    if (stored) {
      store.commit('active', stored)
    }
  },

  choose(store, campus) {
    if (!isValid(campus)) {
      return
    }
    store.commit('active', campus)
    writeStored(campus)
  }
}

const mutations = {
  active(state, campus) {
    state.active = campus
  }
}

const getters = {
  // Always answers with a usable campus so the map and list can filter before the
  // picker has been answered -- otherwise the app would sit empty behind the modal.
  active(state) {
    return state.active || DEFAULT_CAMPUS
  },

  // Whether the user has actually picked, as opposed to falling back to the
  // default. This is what decides if the picker opens.
  chosen(state) {
    return state.active !== null
  },

  campuses() {
    return CAMPUSES
  },

  label(state, getters) {
    const match = CAMPUSES.find(campus => campus.id === getters.active)
    return match ? match.label : ''
  }
}

export default {
  namespaced: true,
  state,
  actions,
  mutations,
  getters
}
