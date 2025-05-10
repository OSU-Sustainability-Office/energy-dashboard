<!--
  Filename: chartController.vue
  Description: Handles the display logic for the meter-data charts on the dashboard (both for the map-interface and building-list).
-->
<template>
  <div
    v-loading="loading || !chartData"
    element-loading-background="rgba(0, 0, 0, 0.8)"
    :style="`height: ${height}px; border-radius: 5px; overflow: hidden;`"
  >
    <linechart
      v-if="graphType === 1 && chartData && this.path !== 'map/building_35/block_175'"
      ref="linechart"
      :key="chartRenderKey"
      :chartData="chartData"
      :style="styleC"
      :height="height"
      :invertColors="invertColors"
      :isMultipleTimePeriods="multipleTimePeriods(chartData.datasets)"
      :buildXaxisTick="buildXaxisTick"
      :buildLabel="buildLabel"
      :intervalUnit="$store.getters[path + '/intervalUnit']"
    />
    <barchart
      v-if="graphType === 2 && chartData"
      ref="barchart"
      :chartData="chartData"
      :style="styleC"
      :height="height"
      :invertColors="invertColors"
      :buildLabel="buildLabel"
      :intervalUnit="$store.getters[path + '/intervalUnit']"
    />
    <iframe
      v-if="this.path === 'map/building_35/block_175'"
      :class="iframeClass"
      src="https://mysolarcity.com/Share/007c9349-72ba-450c-aa1f-4e5a77b68f79#/monitoring/historical/month"
      height="600"
      width="1000"
      title="35th Street Solar Array"
    ></iframe>
    <iframe
      v-if="this.path === 'map/building_36/block_176'"
      :class="iframeClass"
      src="https://mysolarcity.com/share/9D5EB0D2-E376-44A1-9B8C-8DFCDD7507A5#/monitoring/historical/month"
      height="600"
      width="1000"
      title="53rd Street Solar Array"
    ></iframe>
    <iframe
      v-if="this.path === 'map/building_37/block_177'"
      :class="iframeClass"
      src="https://mysolarcity.com/Share/38954c21-8669-47b6-8376-835cc24f908c#/monitoring/historical/month"
      height="600"
      width="1000"
      title="Hermiston Solar Array"
    ></iframe>
    <iframe
      v-if="this.path === 'map/building_38/block_178'"
      :class="iframeClass"
      src="https://mysolarcity.com/Share/47cf089a-5b93-4200-8566-e030cb4f8574#/monitoring/historical/month"
      height="600"
      width="1000"
      title="NWREC Data Solar Array"
    ></iframe>
    <iframe
      v-if="this.path === 'map/building_85/block_264'"
      :class="iframeClass"
      src="https://mysolarcity.com/share/BB1ABBE8-1FB9-4C17-BB0A-A1DE9339DB1C#/monitoring/historical/month"
      height="600"
      width="1000"
      title="Aquatic Animal Health Lab Solar Array"
    ></iframe>
    <el-col :span="24" class="NoData" :style="`height:${height}px;line-height:${height}px;`" v-if="graphType == 100"
      >Data Unavailable</el-col
    >
  </div>
</template>
<script>
import linechart from '@/components/charts/linechart.vue'
import barchart from '@/components/charts/barchart.vue'

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
    linechart,
    barchart
  },
  mounted () {
    console.log(this.$route.path)
  },
  watch: {
    path: function (value) {
      this.updateChart()
    }
  },
  data () {
    return {
      chartRenderKey: 0,
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
    /*
      This looks weird (or at least it did to me) but it's
      actually the proper way of fetching async API data from
      a vue component (at least from what I can tell).

      Basically this is attaching an event listener to
      the Vuex store (which we later remove in the beforeUnmount hook)
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
    iframeClass () {
      if (this.$route.path.startsWith('/map')) {
        return 'scaled-iframe'
      } else {
        return 'building-iframe'
      }
    },
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
          default:
            return null
        }
      }
    }
  },
  beforeUnmount () {
    if (this.unsubscribe) {
      this.unsubscribe()
    }
  },
  methods: {
    updateChart: function () {
      if (!this.path) return
      this.loading = true
      this.$store
        .dispatch(this.path + '/getData')
        .then(data => {
          // Set the unit (metric type) for each dataset
          data.datasets.forEach((dataset, index) => {
            dataset.unit = this.unit(index)
          })
          // Set the chart data
          this.chartData = data
          // Set the chart options
          this.$nextTick(() => {
            if (
              this.chart &&
              (this.graphType === 1 || this.graphType === 2) &&
              data.datasets.length >= 1 &&
              data.datasets[0].data.length >= 1
            ) {
              // format charts if there are multiple time periods
              if (this.multipleTimePeriods(data.datasets)) {
                this.formatMultipleTimePeriods(data.datasets)
              }

              let timeDif =
                new Date(data.datasets[0].data[data.datasets[0].data.length - 1].x).getTime() -
                new Date(data.datasets[0].data[0].x).getTime()
              let dif = 0
              if (timeDif <= 24 * 60 * 60 * 1000) {
                dif = 2
                this.chart.options.scales.x.time.unit = 'minute'
              } else if (timeDif <= 7 * 24 * 60 * 60 * 1000) {
                dif = 1
                this.chart.options.scales.x.time.unit = 'hour'
              } else {
                this.chart.options.scales.x.time.unit = 'day'
              }
              this.chart.options.scales.y.ticks.maxTicksLimit = (this.height / 200) * 8 - dif
            }
            console.log(this.path)
            this.chartRenderKey++
            this.loading = false
          })
        })
        .catch(err => {
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
          result.push(Math.round(typicalColor[0] + greenInt[0] * compare))
          result.push(Math.round(typicalColor[1] - greenInt[1] * compare))
          result.push(Math.round(typicalColor[2] - greenInt[2] * compare))
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
        if (point.length > 50) {
          point = point.substring(0, 50) + '...'
        }
        return point
      } else {
        // if there are multiple time period charts, don't display a label on the bottom as the time
        // periods will be displayed individually on the top
        if (this.multipleTimePeriods(this.chartData.datasets)) {
          return ' '
        }

        const date1 = new Date(this.dateStart)
        const date2 = new Date(this.dateEnd)
        if (date1 && date2) {
          return date1.toDateString() + ' to ' + date2.toDateString()
        } else {
          return ' '
        }
      }
    },
    multipleTimePeriods: function (charts) {
      if (charts.length > 1 && charts[0].multStart && charts[0].multStart.length > 1) {
        return true
      }
      return false
    },
    // this formats a chart with multiple time periods, changing labels, aligning all charts to the left,
    // and mapping datasets so that hovering displays the correct date
    formatMultipleTimePeriods: function (charts) {
      // change the labels to match the time period for each chart
      for (let chart of charts) {
        chart.label = chart.data[0].x.toDateString() + ' to ' + chart.data[chart.data.length - 1].x.toDateString()
      }

      // find chart with largest dataset
      let largestChart = charts[0]
      for (let i in charts) {
        if (charts[i].data.length > largestChart.data.length) {
          largestChart = charts[i]
        }
      }

      // map all other datasets to the largest dataset
      for (let chart of charts) {
        // check if current chart is the largest chart, don't map if so
        // may need a better way to differentiate charts, but this works for now
        // and accounts for have two charts that are the same length
        if (chart.backgroundColor !== largestChart.backgroundColor) {
          // loop through all data points in current chart and map x-value to largest chart
          // also create a datapoint for the original x-value so that we can display it on tooltip hover
          for (let i in chart.data) {
            if (chart.data[i].y != null) {
              chart.data[i].originalX = chart.data[i].x
              chart.data[i].x = largestChart.data[i].x
            }
          }
        }
      }
    },
    // this is called when there are multiple time period charts, it returns an array of all the
    // chart dates for that index so that they can be displayed on multiple lines
    buildXaxisTick (index) {
      const interval = this.$store.getters[this.path + '/intervalUnit']

      if (this.chartData.datasets) {
        let tick = []
        for (let chart of this.chartData.datasets) {
          let date = ''

          if (chart.data[index]) {
            if (chart.data[index].originalX) {
              date = chart.data[index].originalX
            } else {
              date = chart.data[index].x
            }

            switch (interval) {
              case 'day':
                date = date.toLocaleDateString('en-US', { month: 'numeric', day: '2-digit' })
                break
              case 'hour':
              case 'minute':
                date =
                  date.toLocaleDateString('en-US', { weekday: 'short' }).substring(0, 2) +
                  ' ' +
                  date.toLocaleTimeString('en-US', { hour: 'numeric', minute: '2-digit' })
                break
              case 'month':
                date = date.toLocaleDateString('en-US', { month: 'short', year: 'numeric' })
                break
            }
          }

          tick.push(date)
        }

        return tick
      }

      return ''
    }
  }
}
</script>
<style lang="scss" scoped>
.NoData {
  text-align: center;
  color: $color-black;
  font-weight: 800;
  font-size: 22px;
}
.scaled-iframe {
  transform: scale(0.4);
  transform-origin: top left;
}
.building-iframe {
  height: 600px;
  width: 1000px;
}
@media only screen and (max-width: 600px) {
  .building-iframe {
    height: 600px;
    width: 600px;
  }
}
</style>
