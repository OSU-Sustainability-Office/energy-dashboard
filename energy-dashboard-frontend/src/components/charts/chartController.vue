<template>
  <div>
    <linechart v-if="graphType == 1" ref="linechart" v-bind:chartData="chartData" :style="styleC"/>
    <barchart v-if="graphType == 2" ref="barchart" v-bind:chartData="chartData" :style="styleC" />
    <doughnutchart v-if="graphType == 3" ref="doughnutchart" v-bind:chartData="chartData" :style="styleC" />
    <piechart v-if="graphType == 4" ref="piechart" v-bind:chartData="chartData" :style="styleC" />
  </div>
</template>
<script>
import linechart from '@/components/charts/linechart.js'
import barchart from '@/components/charts/barchart.js'
import doughnutchart from '@/components/charts/doughnutchart.js'
import piechart from '@/components/charts/piechart.js'
import { mapGetters } from 'vuex'

export default {
  name: 'card',
  props: ['index', 'graphType', 'styleC', 'randomColors'],
  components: {
    linechart, barchart, doughnutchart, piechart
  },
  mounted () {
    this.chart = this.$refs.barchart
  },
  data () {
    return {
      chartData: {
        datasets: [],
        labels: []
      },
      colors: ['#4A773C', '#00859B', '#FFB500', '#006A8E', '#C4D6A4', '#B8DDE1', '#FDD26E', '#C6DAE7', 'AA9D2E', '#0D5257', '#D3832B', '#003B5C', '#B7A99A', '#A7ACA2', '#7A6855', '#8E9089']
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
  },
  computed: {
    ...mapGetters([
      'story',
      'block'
    ])
  },
  watch: {
    graphType: function (value) {
      // console.log(value);
      value = parseInt(value)
      if (value === 1) {
        this.chart = this.$refs.linechart
        this.parseDataBarLine()
      } else if (value === 2) {
        this.chart = this.$refs.barchart
        this.parseDataBarLine()
      } else if (value === 3) {
        this.chart = this.$refs.doughnutchart
      } else if (value === 4) {
        this.chart = this.$refs.piechart
      }
      this.updateChart()
    }
  },
  methods: {
    checkInterval: function (date) {
      let unit = this.story.blocks[this.index].interval_unit
      let int = this.story.blocks[this.index].date_interval
      let uD = 0
      if (unit !== 'minute') {
        if (date.slice(14, 16) !== '00') {
          return true
        }
        if (unit !== 'hour') {
          if (date.slice(11, 13) !== '00') {
            return true
          }
          if (unit !== 'day') {
            if (date.slice(8, 10) !== '00') {
              return true
            }
          }
        }
      }
      switch (unit) {
        case 'minute':
          uD = date.slice(14, 16)
          break
        case 'hour':
          uD = date.slice(11, 13)
          break
        case 'day':
          uD = date.slice(8, 10)
          break
        case 'month':
          uD = date.slice(5, 7)
          break
        default:
          break
      }
      return (uD % int)
    },
    updateChart: function () {
      if (this.chart) { this.chart.update() }
    },
    parseDataPieDoughnut: function (indexM, groupId, data) {
      if (!data || !groupId) { return }
      if (!this.chartData.datasets[0] || !this.chartData.datasets[0].data || this.chartData.datasets[0].mpoint) {
        this.chartData = {
          labels: [],
          datasets: [{
            data: []
          }]
        }
        this.chartData.datasets[0].backgroundColor = this.colors
      }

      this.chartData.datasets[0].data[indexM] = 0

      this.chartData.labels[indexM] = this.names[indexM]
      let kArray = Object.keys(data)
      if (kArray.length === 0) { return }

      let innerKey = Object.keys(data[kArray[0]])[0]
      this.chartData.datasets[0].data[indexM] = data[kArray[kArray.length - 1]][innerKey] - data[kArray[0]][innerKey]
    },
    parseDataBarLine: function () {
      let i = 0
      let tempData = {
        datasets: [],
        labels: []
      }
      for (let line of this.block(this.index).charts) {
        var data = line.data
        for (let o = data.length - 1; o >= 1; o--) {
          if (this.checkInterval(data[o].x) || !data[o].y) {
            data.splice(o, 1)
            continue
          }
          if (line.point === 'accumulated_real') {
            data[o].y -= data[o - 1].y
          }
        }
        data.splice(0, 1)
        tempData.datasets.push({
          label: line.name,
          data: line.data,
          backgroundColor: this.colors[i],
          borderColor: this.colors[i],
          fill: false,
          showLine: true,
          spanGaps: true
        })
        i++
      }
      this.chartData = tempData
    }
  }
}
</script>
