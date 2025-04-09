/**
  Filename: campaign_linebar.mod.js
  Description: Block modifier for displaying the current
  and baseline values from the chart module. This modifier
  is used for the campaign line/bar charts.
*/

export default class CampaignLineBarModifier {
  static name = 'campaign_linebar'

  constructor (store, module) {
    /*
      Initialize the modifier here,
      this is only an example modifier that
      does nothing. Expect the instance
      variables to be more descriptive for
      specific modifiers
    */
    this.promise = null
    this.data = {
      accumulatedPercentage: 0,
      rank: -1,
      compareStart: 0,
      compareEnd: 0
    }
  }

  /*
   * Function is called when a modifier is added to a block.
   * Store is Vuex store, module is block module.
   */
  async onAdd (store, module) {
  }

  /*
    Function is called when a modifier is removed from a block.
    Store is Vuex store, module is block module.
  */
  async onRemove (store, moduleVuex) {
  }

  /*
   * Function is called when a block updates modifier data.
   * Store is Vuex store, module is block module, data is new incoming data.
   */
  async updateData (store, moduleVuex, data) {
    if (data.compareEnd && data.compareStart) {
      this.data.compareEnd = data.compareEnd
      this.data.compareStart = data.compareStart
    }
    if (data.rank !== undefined) {
      this.data.rank = data.rank
    }
  }

  /*
    Function to get the meter point based on the meter class.
    For Pacific Power meters, the point is baseline_total.
    For all other meters, the point is avg_accumulated_real.
  */
  getMeterPoint (store, moduleVuex) {
    let point = 'avg_accumulated_real'
    const chart = moduleVuex.getters.charts[0]
    const meterGroupPath = chart.meterGroupPath
    const meterClass = (store.getters[meterGroupPath + '/meters'][0].classInt)
    if (meterClass === 9990002) {
      point = 'baseline_total'
    }
    return point
  }

  /*
    * Function to get the colors for the current data based on the baseline data.
    * The colors are computed based on the percentage difference from the baseline and
    * returns an array of RGB strings. The function also updates the average accumulated
    * percentage for the current data.
  */
  getColors (current, baseline, data) {
    const colors = []
    this.data.accumulatedPercentage = 0

    // RGB values for the color extremes
    const redRGB = [214, 35, 38] // Red for large positive deviations (> 7.5%)
    const greenRGB = [25, 162, 58] // Green for large negative deviations (< -7.5%)
    // Neutral color for small deviations
    const neutralRGB = [
      redRGB[0] - greenRGB[0],
      greenRGB[1] - redRGB[1],
      greenRGB[2] - redRGB[2]
    ]
    // Threshold for maximum deviation
    const threshold = 7.5

    for (let i in current) {
      // Calculate percentage difference from baseline
      const percentage = (current[i].y / baseline[i].y) * 100 - 100
      this.data.accumulatedPercentage += percentage // update accumulated percentage

      // Compute blend factor (0 to 1)
      const blendFactor = Math.min(Math.abs(percentage) / threshold, 1)
      let blendedRGB = [0, 0, 0]

      if (percentage < -threshold) {
        // Large negative deviation
        blendedRGB = greenRGB
      } else if (percentage > threshold) {
        // Large positive deviation
        blendedRGB = redRGB
      } else if (percentage < 0) {
        // Blend between green and neutral
        blendedRGB = [
          Math.round(neutralRGB[0] - redRGB[0] * blendFactor),
          Math.round(neutralRGB[1] + redRGB[1] * blendFactor),
          Math.round(neutralRGB[2] + redRGB[2] * blendFactor)
        ]
      } else {
        // Blend between red and neutral
        blendedRGB = [
          Math.round(neutralRGB[0] + greenRGB[0] * blendFactor),
          Math.round(neutralRGB[1] - greenRGB[1] * blendFactor),
          Math.round(neutralRGB[2] - greenRGB[2] * blendFactor)
        ]
      }
      // Add RGB string to colors array
      colors.push(`rgb(${blendedRGB[0]}, ${blendedRGB[1]}, ${blendedRGB[2]})`)
    }

    // Set the average accumulated percentage in-place
    this.data.accumulatedPercentage /= current.length

    return colors
  }

  /*
   * Function is called when a block updates modifier data.
   * Store is Vuex store, module is block module, data is new incoming data.
   */
  async preData (store, moduleVuex) {
    if (moduleVuex.getters.charts.length > 1) {
      throw new Error('This block modifier expects only one chart')
    }
    this.data.dlData = {}
    const payload = {
      point: this.getMeterPoint(store, moduleVuex),
      dateStart: moduleVuex.getters.dateStart / 1000,
      dateEnd: moduleVuex.getters.dateEnd / 1000,
      intervalUnit: moduleVuex.getters.intervalUnit,
      dateInterval: moduleVuex.getters.dateInterval,
      graphType: moduleVuex.getters.graphType,
      compareStart: this.data.compareStart / 1000,
      compareEnd: this.data.compareEnd / 1000
    }
    this.promise = store.dispatch(moduleVuex.getters.charts[0].path + '/getData', payload)
  }

  /*
   * Function is called when a block updates modifier data.
   * Store is Vuex store, module is block module, data is new incoming data.
   */
  async postData (store, moduleVuex, data) {
    if (!data) return
    const dlData = (await this.promise).data
    data.datasets.splice(0, 0, {
      label: 'Baseline',
      backgroundColor: '#FFF',
      borderColor: '#FFF',
      fill: false,
      showLine: true,
      spanGaps: false,
      data: dlData,
      type: 'line'
    })
    data.datasets[1].label = 'Current Use'
    data.datasets[1].spanGaps = true

    let current = data.datasets[1].data
    let baseline = data.datasets[0].data

    // Set as no data on leaderboard if baseline and/or current data is empty
    if (baseline.length === 0 || current.length === 0) {
      current = []
      baseline = []
    }

    // Compute the colors for the current data (used for the bar chart)
    const colors = this.getColors(current, baseline)
    data.datasets[1].borderColor = colors[0]
    data.datasets[1].backgroundColor = colors
  }
}
