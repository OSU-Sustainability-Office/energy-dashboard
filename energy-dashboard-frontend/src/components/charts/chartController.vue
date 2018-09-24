<template>
  <div>
    <linechart v-if="graphType == 1" ref="linechart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <barchart v-if="graphType == 2" ref="barchart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <doughnutchart v-if="graphType == 3" ref="doughnutchart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <piechart v-if="graphType == 4" ref="piechart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
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
  props: ['index', 'graphType', 'styleC', 'randomColors', 'height'],
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
        default:
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
          for (let o = data.length - 1; o >= 0; o--) {
            if (this.checkInterval(data[o].x) || !data[o].y) {
              data.splice(o, 1)
            }
          }
          // Then get the difference
          for (let o = data.length - 1; o >= 1; o--) {
            data[o].y -= data[o - 1].y
            if (data[o].y < 0) {
              data[o].y = 0
            }
          }
          // Remove first item that did not have a calculated interval
          data.splice(0, 1)
        } else {
          let lastIndex = 0
          let runningTotal = 0
          let newData = []
          for (let i in data) {
            if (!this.checkInterval(data[i].x)) {
              newData.push({ x: data[i].x, y: (data[i].y + runningTotal) / (i - lastIndex) })
              lastIndex = i
              runningTotal = 0
            } else {
              runningTotal += data[i].y
            }
          }
          data = newData
        }
        tempData.datasets.push({
          label: line.name,
          data: data,
          backgroundColor: this.colors[i],
          borderColor: this.colors[i],
          fill: false,
          showLine: true,
          spanGaps: false
        })
        i++
      }
      this.chartData = tempData
    },
    // Creates either an X or a Y axis label for a chart, depending on the parameters.
    buildLabel: function (axis) {
      if (axis === 'y') {
        // This axis must contain the units for the given chart.point
        const point = this.story.blocks[this.index].charts[0].point
        if (!point) {
          return ''
        }

        if (this.$parent.$options._componentTag === 'sideView') {
          return ''
        }
        switch (point) {
          case 'accumulated_real' :
            return 'Accumulated Real Energy Net (kWh)'
          case 'real_power':
            return 'Total Real Power (W)'
          case 'reactive_power':
            return 'Total Reactive Power (var)'
          case 'apparent_power':
            return 'Total Apparent Power (VA)'
          case 'real_a':
            return 'Real Power, Phase A (kW)'
          case 'real_b':
            return 'Real Power, Phase B (kW)'
          case 'real_c':
            return 'Real Power, Phase C (kW)'
          case 'reactive_a':
            return 'Reactive Power, Phase A (kVAR)'
          case 'reactive_b':
            return 'Reactive Power, Phase B (kVAR)'
          case 'reactive_c':
            return 'Reactive Power, Phase C (kVAR)'
          case 'pf_a':
            return 'Power Factor, Phase A'
          case 'pf_b':
            return 'Power Factor, Phase B'
          case 'pf_c':
            return 'Power Factor, Phase C'
          case 'vphase_ab':
            return 'Voltage Phase, Phase A-B (V)'
          case 'vphase_bc':
            return 'Voltage Phase, Phase B-C (V)'
          case 'vphase_ac':
            return 'Voltage Phase, Phase A-C (V)'
          case 'vphase_an':
            return 'Voltage Phase, Phase A-N (V)'
          case 'vphase_bn':
            return 'Voltage Phase, Phase B-N (V)'
          case 'vphase_cn':
            return 'Voltage Phase, Phase C-N (V)'
          case 'cphase_a':
            return 'Current Phase, Phase A (A)'
          case 'cphase_b':
            return 'Current Phase, Phase B (A)'
          case 'cphase_c':
            return 'Current Phase, Phase C (A)'
          case 'cubic_feet':
            return 'Total Natural Gas (CF)'
          case 'maximum':
            return 'Peak Natural Gas Flow (CFm)'
          case 'minimum':
            return 'Minimum Natural Gas Flow (CFm)'
          case 'instant':
            return 'Natural Gas Instantaneous (CFm)'
          case 'rate':
            return 'Natural Gas Rate (CFm)'
          case 'total':
            return 'Steam (Pounds)'
          case 'input':
            return 'Steam Input'
        }
      } else {
        const date1 = new Date(this.story.blocks[this.index].date_start)
        const date2 = new Date(this.story.blocks[this.index].date_end)
        if (date1 && date2) {
          return date1.toDateString() + ' to ' + date2.toDateString()
        } else {
          return ''
        }
      }
    }
  }
}
</script>
