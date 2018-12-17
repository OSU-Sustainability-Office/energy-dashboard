<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-13T17:14:29-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2018-12-17T12:54:45-08:00
-->
<template>
  <div element-loading-background="rgba(0, 0, 0, 0.8)">
    <linechart v-if="graphType == 1" ref="linechart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <barchart v-if="graphType == 2" ref="barchart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <doughnutchart v-if="graphType == 3" ref="doughnutchart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <piechart v-if="graphType == 4" ref="piechart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <el-col :span='24' class='NoData' :style='`height:${height}px;line-height:${height}px;`' v-if="graphType == 100">Data Unavailable</el-col>
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
    switch (parseInt(this.graphType)) {
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
  },
  data () {
    return {
      chart: null,
      loading: true,
      chartData: {
        datasets: [],
        labels: []
      },
      colors: ['#4A773C', '#00859B', '#FFB500', '#006A8E', '#C4D6A4', '#B8DDE1', '#FDD26E', '#C6DAE7', '#AA9D2E', '#0D5257', '#D3832B', '#003B5C', '#B7A99A', '#A7ACA2', '#7A6855', '#8E9089'],
      map: {
        minute: 0,
        hour: 1,
        day: 2,
        month: 3
      }
    }
  },
  created () {
    this.$eventHub.$on('loadingData', (ind) => {

      // this.loading = true
    })
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
      // this.parse()
      // this.updateChart()
    }
  },
  methods: {
    parse: function () {
      if (!this.chart) {
        switch (this.graphType) {
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
            this.chart = null
        }
      }
      if (this.graphType === 1 || this.graphType === 2) {
        this.parseDataBarLine()
      } else if (this.graphType === 3 || this.graphType === 4) {
        this.parseDataPieDoughnut()
      }
    },
    checkInterval: function (date, unit, int, start) {
      if (int <= 15 && unit === 'minute') return false
      date = new Date(date)

      start = new Date(start)
      start.setTime(start.getTime() - 60 * 1000 * start.getTimezoneOffset())
      const br = [start.getMinutes(), start.getHours(), start.getDate(), start.getMonth()]
      const ar = [date.getMinutes(), date.getHours(), date.getDate(), date.getMonth()]
      for (let i = this.map[unit]; i >= 0; i--) {
        if (i === this.map[unit]) {
          if ((ar[i] - br[i]) % int !== 0) {
            return true
          }
        } else if ((ar[i] - br[i]) !== 0) {
          return true
        }
      }
      return false
    },
    updateChart: function () {
      if (this.chart) { this.chart.update() }
    },
    dataUnavailable: function () {
      this.graphType = 100
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
      let noDataCount = 0
      for (let piece of this.block(this.index).charts) {
        if (!piece.data || piece.data.length === 0) {
          noDataCount++
          continue
        }
        let value = piece.data[piece.data.length - 1].y - piece.data[0].y
        tempData.datasets[0].data.push(value)
        tempData.datasets[0].backgroundColor.push(this.colors[index])
        tempData.labels.push(piece.name)
        index++
      }
      if (noDataCount === this.block(this.index).charts.length) {
        this.dataUnavailable()
        return
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
      let noDataCount = 0
      for (let line of this.block(this.index).charts) {
        // Deep copy prevents callbacks to data changing on computed variables
        if (!line.data || line.data.length === 0) {
          noDataCount++
          continue
        }
        let data = JSON.parse(JSON.stringify(line.data))

        const unit = this.story.blocks[this.index].interval_unit
        const int = this.story.blocks[this.index].date_interval
        const start = this.story.blocks[this.index].date_start

        let lastIndex = 0
        let runningTotal = 0
        let newData = []
        if (line.point === 'accumulated_real' || line.point === 'total' || line.point === 'cubic_feet') {
          for (let i in data) {
            if (!this.checkInterval(data[i].x, unit, int, start)) {
              newData.push({ x: data[i].x, y: (data[i].y + runningTotal) })
              lastIndex = i
              runningTotal = 0
            } else {
              runningTotal += data[i].y
            }
          }
        } else {
          for (let i in data) {
            if (!this.checkInterval(data[i].x, unit, int, start)) {
              newData.push({ x: data[i].x, y: (data[i].y + runningTotal) / (i - lastIndex) })
              lastIndex = i
              runningTotal = 0
            } else {
              runningTotal += data[i].y
            }
          }
        }
        data = newData
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
      if (noDataCount === this.block(this.index).charts.length) {
        this.dataUnavailable()
        return
      }
      this.chartData = tempData
    },
    unit: function () {
      const map = {
        accumulated_real: 'kWh',
        real_power: 'W',
        reactive_power: 'VAR',
        apparent_power: 'VA',
        real_a: 'kW',
        real_b: 'kW',
        real_c: 'kW',
        reactive_a: 'VAR',
        reactive_b: 'VAR',
        reactive_c: 'VAR',
        pf_a: '',
        pf_b: '',
        pf_c: '',
        vphase_ab: 'V',
        vphase_bc: 'V',
        vphase_ac: 'V',
        vphase_an: 'V',
        vphase_bn: 'V',
        vphase_cn: 'V',
        cphase_a: 'A',
        cphase_b: 'A',
        cphase_c: 'A',
        cubic_feet: 'CF',
        maximum: 'CFm',
        minimum: 'CFm',
        instant: 'CFm',
        rate: 'CFm',
        total: 'lbs.',
        input: ''
      }
      return map[this.story.blocks[this.index].charts[0].point]
    },
    getStart: function () {
      return this.story.blocks[this.index].date_start
    },
    getEnd: function () {
      return this.story.blocks[this.index].date_end
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
            return 'Net Energy Usage (kWh)'
          case 'real_power':
            return 'Real Power (W)'
          case 'reactive_power':
            return 'Reactive Power (VAR)'
          case 'apparent_power':
            return 'Apparent Power (VA)'
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
        const date1 = new Date(this.getStart())
        const date2 = new Date(this.getEnd())
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
<style lang='scss' scoped>
@import '@/assets/style-variables.scss';

  .NoData {
    text-align: center;
    color: $--color-white;
    font-weight: 800;
    font-size: 22px;
  }
</style>
