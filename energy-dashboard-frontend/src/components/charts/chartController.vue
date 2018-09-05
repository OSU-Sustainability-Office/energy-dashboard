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
    this.parse()
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
      } else if (value === 2) {
        this.chart = this.$refs.barchart
      } else if (value === 3) {
        this.chart = this.$refs.doughnutchart
      } else if (value === 4) {
        this.chart = this.$refs.piechart
      }
      this.parse()
      this.updateChart()
    }
  },

  methods: {
    parse: function () {
      if (this.graphType === 1 || this.graphType === 2) {
        this.parseDataBarLine()
      } else if (this.graphType === 3 || this.graphType === 4) {
        this.parseDataPieDoughnut()
      }
    },
    checkInterval: function (date) {
      let unit = this.story.blocks[this.index].interval_unit
      let int = this.story.blocks[this.index].date_interval
      let uD = 0

      let m = date.slice(14, 16)
      let h = date.slice(11, 13)
      let d = date.slice(8, 10)
      if (unit !== 'minute') {
        if (m !== '00') {
          return true
        }
        if (unit !== 'hour') {
          if (h !== '00') {
            return true
          }
          if (unit !== 'day') {
            if (d !== '00') {
              return true
            }
          }
        }
      }
      switch (unit) {
        case 'minute':
          uD = m
          break
        case 'hour':
          uD = h
          break
        case 'day':
          uD = d
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
    parseDataPieDoughnut: function () {
      if (!this.block(this.index)) {
        return
      }
      let tempData = {
        datasets: [{
          data: [],
          backgroundColor: []
        }],
        labels: []
      }
      let index = 0
      for (let piece of this.block(this.index).charts) {
        if (!piece.data) {
          return
        }
        let value = piece.data[piece.data.length - 1].y - piece.data[0].y
        tempData.datasets[0].data.push(value)
        tempData.datasets[0].backgroundColor.push(this.colors[index])
        tempData.labels.push(piece.name)
        index++
      }

      this.chartData = tempData
    },
    parseDataBarLine: function () {
      let i = 0
      let tempData = {
        datasets: [],
        labels: []
      }
      if (!this.block(this.index)) {
        return
      }
      for (let line of this.block(this.index).charts) {
        // Deep copy prevents callbacks to data changing on computed variables
        if (!line.data) {
          return
        }
        let data = JSON.parse(JSON.stringify(line.data))

        if (line.point === 'accumulated_real' || line.point === 'total' || line.point === 'cubic_feet') {
          // First remove interval items
          for (let o = data.length - 1; o >= 1; o--) {
            if (this.checkInterval(data[o].x) || !data[o].y) {
              data.splice(o, 1)
            }
          }
          // Then get the difference
          for (let o = data.length - 1; o >= 1; o--) {
            data[o].y -= data[o - 1].y
          }
          // Remove first item that did not have a calculated interval
          data.splice(0, 1)
        }
        tempData.datasets.push({
          label: line.name,
          data: data,
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
