<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-13T17:14:29-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-04-09T11:43:22-07:00
-->
<template>
  <div v-loading='loading || !chartData' element-loading-background="rgba(0, 0, 0, 0.8)" :style='`height: ${height}; border-radius: 5px; overflow: hidden;`'>
    <linechart v-if="graphType == 1 && chartData" ref="linechart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <barchart v-if="graphType == 2 && chartData" ref="barchart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <doughnutchart v-if="graphType == 3 && chartData" ref="doughnutchart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <piechart v-if="graphType == 4 && chartData" ref="piechart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <barchart v-if="graphType == 5 && chartData" ref="barlinechart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
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
  props: ['styleC', 'randomColors', 'height', 'path'],
  components: {
    linechart, barchart, doughnutchart, piechart
  },
  mounted () {
    if (this.promise === null) {
      this.loading = false
    } else {
      this.promise.then(() => {
        this.loading = false
      })
    }
    this.$store.dispatch(this.path + '/getData').then(r => {
      this.chartData = r
      this.loading = false
    })
  },
  data () {
    return {
      chart: null,
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
    // this.$store.dispatch(this.block.path + '/getData').then(data => {
    //   this.chartData = data
    //   this.loading = false
    // })
    this.$store.subscribe((mutation, state) => {
      let mutationPath = mutation.type.split('/')
      mutationPath.pop()
      mutationPath = mutationPath.join('/')
      if (mutationPath === this.path) {
        this.loading = true
        clearTimeout(this.watchTimeout)
        this.watchTimeout = setTimeout(() => {
          this.$store.dispatch(this.path + '/getData').then(data => {
            this.chartData = data
            this.loading = false
          })
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
        return this.$store.getters[this.path + '/graphType']
      }
    }
  },
  watch: {
    graphType: function (value) {
      value = parseInt(value)
      switch (value) {
        case 1:
          this.chart = this.$refs.linechart
          break
        case 2:
          this.chart = this.$refs.barchart
          break
        case 3:
          this.chart = this.$refs.doughnutchart
          break
        case 5:
          this.chart = this.$refs.barlinechart
          break
        default:
          this.chart = this.$refs.piechart
      }
      // this.parse()
      // this.updateChart()
    }
  },
  methods: {
    unit: function () {
      const charts = this.$store.getters[this.path + '/charts']
      const unit = this.$store.getters[charts[0].path + '/unitString']
      return unit
    },
    dataUnavailable: function () {
      this.graphType = 100
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
        const point = this.$store.getters[charts[0].path + '/pointString']
        if (!point) {
          return ' '
        }

        if (this.$parent.$options._componentTag === 'sideView') {
          return ' '
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
    color: $--color-white;
    font-weight: 800;
    font-size: 22px;
  }
</style>
