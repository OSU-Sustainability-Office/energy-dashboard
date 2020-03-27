/*
 * @Author: you@you.you
 * @Date:   Wednesday March 25th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Wednesday March 25th 2020
 * @Copyright:  (c) Oregon State University 2020
 */
export default class CampaignLineBarModifier {
  static name = 'campaign_linebar'

  constructor (store, module) {
    /*
      Initialize the modifier here,
      this is only an example modifier that
      doed nothing. I expect the instance
      variables to be more descriptive for
      specific modifiers
    */
    this.data = {
      accumulatedPercentage: 0,
      rank: -1,
      compareStart: 0,
      compareEnd: 0,
      dlData: {}
    }
  }

  async onAdd (store, module) {
    /*
      Function is called when a modifier
      is added to a block. Store is Vuex store
      module is block module.
    */
  }

  async onRemove (store, moduleVuex) {
    /*
      Function is called when a modifier
      is removed from a block. Store is Vuex store
      module is block module.
    */
  }

  async updateData (store, moduleVuex, data) {
    /*
      Function is called when a block
      updates modifier data. Store is Vuex store
      module is block module, data is new incoming
      data.
    */
    if (data.compareEnd && data.compareStart) {
      this.data.compareEnd = data.compareEnd
      this.data.compareStart = data.compareStart
    }
    if (data.rank !== undefined) {
      this.data.rank = data.rank
    }
  }

  async preData (store, moduleVuex) {
    /*
      Function is called when a block
      updates modifier data. Store is Vuex store
      module is block module, data is new incoming
      data.
    */
    this.data.dlData = {}
    const payload = {
      point: 'avg_accumulated_real',
      dateStart: moduleVuex.getters.dateStart / 1000,
      dateEnd: moduleVuex.getters.dateEnd / 1000,
      intervalUnit: moduleVuex.getters.intervalUnit,
      dateInterval: moduleVuex.getters.dateInterval,
      graphType: moduleVuex.getters.graphType,
      compareStart: this.data.compareStart / 1000,
      compareEnd: this.data.compareEnd / 1000
    }
    for (let chart of moduleVuex.getters.charts) {
      let cData = await store.dispatch(chart.path + '/getData', payload)
      this.data.dlData = cData
    }
  }
  async postData (store, moduleVuex, data) {
    /*
      Function is called when a block
      updates modifier data. Store is Vuex store
      module is block module, data is new incoming
      data.
    */
    if (!data) return
    data.datasets.splice(0, 0, {
      label: 'Baseline',
      backgroundColor: '#FFF',
      borderColor: '#FFF',
      fill: false,
      showLine: true,
      spanGaps: false,
      data: this.data.dlData.data,
      type: 'line'
    })
    data.datasets[1].label = 'Current Use'

    let current = data.datasets[1].data
    let baseline = data.datasets[0].data
    let colors = []
    this.data.accumulatedPercentage = 0
    for (let i in current) {
      const percentage = (current[i].y / baseline[i].y) * 100 - 100
      this.data.accumulatedPercentage += percentage
      const redInt = [parseInt('0xd6', 16), parseInt('0x23', 16), parseInt('0x26', 16)]
      const greenInt = [parseInt('0x19', 16), parseInt('0xa2', 16), parseInt('0x3a', 16)]
      const typicalColor = [redInt[0] - greenInt[0], greenInt[1] - redInt[1], greenInt[2] - redInt[2]]
      const compare = Math.abs(percentage) / 7.5
      const result = []
      if (percentage < -7.5) {
        result.push(greenInt[0])
        result.push(greenInt[1])
        result.push(greenInt[2])
      } else if (percentage > 7.5) {
        result.push(redInt[0])
        result.push(redInt[1])
        result.push(redInt[2])
      } else if (percentage < 0) {
        result.push(Math.round(typicalColor[0] - redInt[0] * compare))
        result.push(Math.round(typicalColor[1] + redInt[1] * compare))
        result.push(Math.round(typicalColor[2] + redInt[2] * compare))
      } else {
        result.push(Math.round(typicalColor[0] + greenInt[0] * (compare)))
        result.push(Math.round(typicalColor[1] - greenInt[1] * (compare)))
        result.push(Math.round(typicalColor[2] - greenInt[2] * (compare)))
      }
      colors.push('rgb(' + result[0].toString() + ',' + result[1].toString() + ',' + result[2].toString() + ')')
    }
    data.datasets[1].borderColor = colors[0]
    data.datasets[1].backgroundColor = colors
    this.data.accumulatedPercentage /= current.length
  }
}
