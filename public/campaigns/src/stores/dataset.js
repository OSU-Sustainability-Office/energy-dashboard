// filename: dataset.js
// info: stores the meter building data
import { defineStore } from 'pinia'

export const useMeterStore = defineStore('counter', {
  state: () => {
    return { count: 0 }
  }
})

