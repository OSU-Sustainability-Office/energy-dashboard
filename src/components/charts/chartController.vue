<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-13T17:14:29-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-04-09T11:43:22-07:00
-->
<template>
  <div v-loading='loading' element-loading-background="rgba(0, 0, 0, 0.8)" :style='`height: ${height}; border-radius: 5px; overflow: hidden;`'>
    <linechart v-if="graphType == 1" ref="linechart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <barchart v-if="graphType == 2" ref="barchart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <doughnutchart v-if="graphType == 3" ref="doughnutchart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <piechart v-if="graphType == 4" ref="piechart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
    <barchart v-if="graphType == 5" ref="barlinechart" v-bind:chartData="chartData" :style="styleC" :height='height'/>
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
  props: ['index', 'graphType', 'styleC', 'randomColors', 'height', 'block'],
  components: {
    linechart, barchart, doughnutchart, piechart
  },
  mounted () {
    console.log(this.block)
    if (this.block.promise === null){
      this.loading = false
    } else {
      this.block.promise.then(() => {
        this.loading = false
      })
    }
    this.$store.dispatch(this.block.path + '/getData').then(r => {
      console.log(r)
    })
    // switch (parseInt(this.graphType)) {
    //   case 1:
    //     this.chart = this.$refs.linechart
    //     break
    //   case 2:
    //     this.chart = this.$refs.barchart
    //     break
    //   case 3:
    //     this.chart = this.$refs.doughnutchart
    //     break
    //   case 5:
    //     this.chart = this.$refs.barlinechart
    //     break
    //   default:
    //     this.chart = this.$refs.piechart
    // }
  },
  data () {
    return {
      chart: null,
      loading: true,
      colors: ['#4A773C', '#00859B', '#FFB500', '#AA9D2E', '#D3832B', '#0D5257', '#7A6855', '#C4D6A4'],
      map: {
        minute: 0,
        hour: 1,
        day: 2,
        month: 3
      }
    }
  },
  created () {
    this.$eventHub.$on('loadingData', () => {

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
  asyncComputed: {
    chartData: {
      get: () => {
        return this.$store.dispatch(this.block.path + '/getData')
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
          case 5:
            this.chart = this.$refs.barlinechart
            break
          default:
            this.chart = null
        }
      }
      if (this.graphType === 1 || this.graphType === 2 || this.graphType === 5) {
        this.parseDataBarLine()
      } else if (this.graphType === 3 || this.graphType === 4) {
        this.parseDataPieDoughnut()
      }
    },
    checkInterval: function (date, unit, int, start) {
      if (int <= 15 && unit === 'minute') return false
      let startDay = Math.floor((start.getTime() - (new Date(start.getFullYear(), 0, 0, 0, 0, 0, 0)).getTime()) / 86400000)
      let endDay = Math.floor((date.getTime() - (new Date(start.getFullYear(), 0, 0, 0, 0, 0, 0)).getTime()) / 86400000)

      const br = [start.getMinutes(), start.getHours(), startDay, start.getMonth()]
      const ar = [date.getMinutes(), date.getHours(), endDay, date.getMonth()]
      for (let i = this.map[unit]; i >= 0; i--) {
        if (i === this.map[unit]) {
          if ((ar[i] - br[i]) % int !== 0 || (ar[i] === 0 && i === 3)) {
            return true
          }
        } else if (this.map[unit] === 3 && i === 2) {
          if (start.getDate() !== date.getDate()) {
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
    displayFormat: function () {
      // if (this.block(this.index).interval_unit === 'minute') {
      //   return 'minute'
      // } else if (this.block(this.index).interval_unit === 'hour') {
      //   return 'hour'
      // } else {
      //   return 'day'
      // }
    },
    parseDataPieDoughnut: function () {
      // if (!this.block(this.index)) {
      //   return
      // }
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
        let value = 0
        for (let v of piece.data) {
          value += v.y
        }
        if (piece.point !== 'accumulated_real' && piece.point !== 'total' && piece.point !== 'cubic_feet') {
          value /= piece.data.length
        }
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
        let startO = new Date(start)
        startO.setMinutes(Math.floor(startO.getMinutes() / 15.0) * 15)
        startO.setSeconds(0)
        startO.setMilliseconds(0)
        if (line.point === 'accumulated_real' || line.point === 'total' || line.point === 'cubic_feet') {
          for (let i in data) {
            let date = new Date(data[i].x)
            if (!this.checkInterval(date, unit, int, startO)) {
              if (date >= startO) newData.push({ x: data[i].x, y: (data[i].y + runningTotal) })
              lastIndex = i
              runningTotal = 0
            } else {
              runningTotal += data[i].y
            }
          }
        } else {
          for (let i in data) {
            let date = new Date(data[i].x)

            if (!this.checkInterval(date, unit, int, startO)) {
              if (date >= startO) newData.push({ x: data[i].x, y: (data[i].y + runningTotal) / (i - lastIndex) })
              lastIndex = i
              runningTotal = 0
            } else {
              runningTotal += data[i].y
            }
          }
        }
        data = newData
        let color = (this.graphType === 5 && this.block(this.index).charts.indexOf(line) === 1) ? this.colorCodedColor(tempData.datasets[0].data, data) : this.colors[i % 8]
        tempData.datasets.push({
          label: line.name,
          data: data,
          backgroundColor: (this.graphType === 5 && this.block(this.index).charts.indexOf(line) !== 1) ? '#FFF' : color,
          borderColor: (this.graphType === 5) ? '#FFFFFF' : color,
          borderDash: [(i >= 8) ? 8 : 0, (i >= 8) ? 10 : 0],
          fill: false,
          showLine: true,
          spanGaps: false,
          type: ((this.graphType === 5 && i === 1) || this.graphType === 2) ? 'bar' : 'line'
        })
        i++
      }
      if (noDataCount === this.block(this.index).charts.length) {
        this.dataUnavailable()
        return
      }
      this.chart.options.scales.xAxes[0].time.unit = this.displayFormat()
      this.chart.options.scales.xAxes[0].scaleLabel.labelString = this.buildLabel('x')
      this.chart.options.scales.yAxes[0].scaleLabel.labelString = this.buildLabel('y')
      this.chart.setOptions(this.chart.options)
      this.chartData = tempData
    },
    unit: function () {
      return this.$store.getters.mapPointUnit(this.story.blocks[this.index].charts[0].point)
    },
    getStart: function () {
      return this.story.blocks[this.index].date_start
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
    getEnd: function () {
      return this.story.blocks[this.index].date_end
    },
    // Creates either an X or a Y axis label for a chart, depending on the parameters.
    buildLabel: function (axis) {
      if (this.story.blocks.length <= this.index) {
        return ' '
      }
      if (axis === 'y') {
        // This axis must contain the units for the given chart.point
        if (this.story.blocks[this.index].charts.length <= 0) {
          return ' '
        }
        const point = this.story.blocks[this.index].charts[0].point
        if (!point) {
          return ' '
        }

        if (this.$parent.$options._componentTag === 'sideView') {
          return ' '
        }
        return this.$store.getters.mapPoint(point)
      } else {
        const date1 = new Date(this.getStart())
        const date2 = new Date(this.getEnd())
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
