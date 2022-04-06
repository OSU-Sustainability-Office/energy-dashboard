<!--
  Filename: chartController.vue
  Description: Handles the display logic for the meter-data charts on the dashboard (both for the map-interface and building-list).
-->
<template>
  <div v-loading='loading || !chartData' element-loading-background="rgba(0, 0, 0, 0.8)" :style='`height: ${height}px; border-radius: 5px; overflow: hidden;`'>
    <linechart v-if="graphType === 1 && chartData" ref="linechart" v-bind:chartData="chartData" :style="styleC" :height='height' :invertColors='invertColors'/>
    <barchart v-if="graphType === 2 && chartData" ref="barchart" v-bind:chartData="chartData" :style="styleC" :height='height' :invertColors='invertColors'/>
    <doughnutchart v-if="graphType === 3 && chartData" ref="doughnutchart" v-bind:chartData="chartData" :style="styleC" :height='height' :invertColors='invertColors'/>
    <piechart v-if="graphType === 4 && chartData" ref="piechart" v-bind:chartData="chartData" :style="styleC" :height='height' :invertColors='invertColors'/>
    <el-col :span='24' class='NoData' :style='`height:${height}px;line-height:${height}px;`' v-if="graphType == 100">Data Unavailable</el-col>
  </div>
</template>
<script>
import linechart from '@/components/charts/linechart.js'
import barchart from '@/components/charts/barchart.js'
import doughnutchart from '@/components/charts/doughnutchart.js'
import piechart from '@/components/charts/piechart.js'

export default {
  name: 'card',
  props: {
    styleC: Object,
    randomColors: Number,
    height: Number,
    path: String,
    invertColors: Boolean
  },
  components: {
    linechart, barchart, doughnutchart, piechart
  },
  mounted () {},
  watch: {
    path: function (value) {
      this.updateChart()
    }
  },
  data () {
    return {
      unsubscribe: null,
      loading: true,
      chartData: null,
      watchTimeout: null,
      colors: ['#4A773C', '#00859B', '#FFB500', '#AA9D2E', '#D3832B', '#0D5257', '#7A6855', '#C4D6A4']
    }
  },
  created () {
    if (parseInt(this.randomColors) === 1) {
      // DurstenFeld Shuffle
      for (var i = this.colors.length - 1; i > 0; i--) {
        var j = Math.floor(Math.random() * (i + 1))
        var temp = this.colors[i]
        this.colors[i] = this.colors[j]
        this.colors[j] = temp
      }
    }
    if (this.path && (this.path.split('/').splice(0, 1)[0] === 'view' || this.path.split('/').splice(0, 1)[0] === 'user')) {
      /*
        Building views set the date once the page is loaded.
        User views need to grab data immediately.
      */
      this.updateChart()
    }
    /*
      This looks weird (or at least it did to me) but it's
      actually the proper way of fetching async API data from
      a vue component (at least from what I can tell).

      Basically this is attaching an event listener to
      the Vuex store (which we later remove in the beforeDestroy hook)
      which will update the chart after the Vuex store calls
      a mutation path which references our path (url/window.location.hash)
      indicating we have new data to show.
    */
    this.unsubscribe = this.$store.subscribe((mutation, state) => {
      if (this.$el.style.display === 'none') return
      let mutationPath = mutation.type.split('/')
      let call = mutationPath.pop()
      mutationPath = mutationPath.join('/')
      if (mutationPath.includes(this.path)) {
        if (call === 'name') {
          return
        }
        clearTimeout(this.watchTimeout)
        this.watchTimeout = setTimeout(() => {
          this.updateChart()
        }, 200)
      }
    })
  },
  computed: {
    promise: {
      get () {
        return this.$store.getters[this.path + '/promise']
      }
    },
    dateStart: {
      get () {
        return this.$store.getters[this.path + '/dateStart']
      }
    },
    dateEnd: {
      get () {
        return this.$store.getters[this.path + '/dateEnd']
      }
    },
    graphType: {
      get () {
        if (this.chartData) {
          let noData = true
          for (let set of this.chartData.datasets) {
            if (set && set.data && set.data.length !== 0) {
              noData = false
              break
            }
          }
          if (noData) {
            return 100
          }
        }
        return parseInt(this.$store.getters[this.path + '/graphType'])
      }
    },
    chart: {
      get () {
        switch (this.graphType) {
          case 1:
            return this.$refs.linechart
          case 2:
            return this.$refs.barchart
          case 3:
            return this.$refs.doughnutchart
          case 5:
            return this.$refs.barlinechart
          default:
            return this.$refs.piechart
        }
      }
    }
  },
  beforeDestroy () {
    this.unsubscribe()
  },
  methods: {
    updateChart: function () {
      if (!this.path) return
      if (!this.$store.getters[this.path]) return
      this.loading = true
      this.$store.dispatch(this.path + '/getData').then(data => {
        if (this.chart && (this.graphType === 1 || this.graphType === 2) && data.datasets.length >= 1 && data.datasets[0].data.length >= 1) {
          this.chart.update()
          let timeDif = (new Date(data.datasets[0].data[data.datasets[0].data.length - 1].x)).getTime() - (new Date(data.datasets[0].data[0].x)).getTime()
          let dif = 0
          if (timeDif <= 24 * 60 * 60 * 1000) {
            dif = 2
            this.chart.options.scales.xAxes[0].time.unit = 'minute'
          } else if (timeDif <= 7 * 24 * 60 * 60 * 1000) {
            dif = 1
            this.chart.options.scales.xAxes[0].time.unit = 'hour'
          } else {
            this.chart.options.scales.xAxes[0].time.unit = 'day'
          }
          this.chart.options.scales.yAxes[0].ticks.maxTicksLimit = (this.height / 200) * 8 - dif
        }
        this.chartData = data
        this.loading = false
        console.log('done loading!', this.path, data)
        // this.$store.getters[this.path]
      }).catch(err => {
        console.log('could not load data', err)
        this.loading = true
      })
    },
    unit: function (index) {
      const charts = this.$store.getters[this.path + '/charts']
      if (index >= charts.length) {
        index = 0
      }
      const unit = this.$store.getters[charts[index].path + '/unitString']
      return unit
    },
    colorCodedColor: function (baseline, current) {
      let colors = []
      for (let i in current) {
        const percentage = (current[i].y / baseline[i].y) * 100 - 100
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
      return colors
    },
    // Creates either an X or a Y axis label for a chart, depending on the parameters.
    buildLabel: function (axis) {
      const charts = this.$store.getters[this.path + '/charts']
      if (axis === 'y') {
        // This axis must contain the units for the given chart.point
        if (charts.length <= 0) {
          return ' '
        }
        let point = ''
        for (let index in charts) {
          const chartPoint = this.$store.getters[charts[index].path + '/pointString']
          if (!point.includes(chartPoint)) {
            if (Number(index) !== 0) {
              point += ' / '
            }
            point += chartPoint
          }
        }
        if (!point) {
          return ' '
        }

        if (this.$parent.$options._componentTag === 'sideView') {
          return ' '
        }
        if (point.length > 50) {
          point = point.substring(0, 50) + '...'
        }
        return point
      } else {
        const date1 = new Date(this.dateStart)
        const date2 = new Date(this.dateEnd)
        if (date1 && date2) {
          return date1.toDateString() + ' to ' + date2.toDateString()
        } else {
          return ' '
        }
      }
    }
  }
}
</script>
<style lang='scss' scoped>
  .NoData {
    text-align: center;
    color: $--color-black;
    font-weight: 800;
    font-size: 22px;
  }
</style>
