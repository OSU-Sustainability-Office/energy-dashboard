<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-13T17:14:29-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-31T15:44:38-08:00
-->
<template>
  <div v-loading='(block(index))? !block(index).loaded : true' element-loading-background="rgba(0, 0, 0, 0.8)" :style='`height: ${height}; border-radius: 5px; overflow: hidden;`'>
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
      case 5:
        this.chart = this.$refs.barlinechart
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
      let startDay = Math.floor((start.getTime() - (new Date(start.getYear(), 0, 0, 0, 0, 0, 0)).getTime()) / 86400000)
      let endDay = Math.floor((date.getTime() - (new Date(date.getYear(), 0, 0, 0, 0, 0, 0)).getTime()) / 86400000)
      const br = [start.getMinutes(), start.getHours(), startDay, start.getMonth()]
      const ar = [date.getMinutes(), date.getHours(), endDay, date.getMonth()]
      for (let i = this.map[unit]; i >= 0; i--) {
        if (i === this.map[unit]) {
          if ((ar[i] - br[i]) % int !== 0) {
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
        tempData.datasets.push({
          label: line.name,
          data: data,
          backgroundColor: this.colors[i % 8],
          borderColor: this.colors[i % 8],
          borderDash: [(i >= 8) ? 8 : 0, (i >= 8) ? 10 : 0],
          fill: false,
          showLine: true,
          spanGaps: false,
          type: (this.graphType === 5 && i === 1) ? 'bar' : 'line'
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
      return this.$store.getters.mapPointUnit(this.story.blocks[this.index].charts[0].point)
    },
    getStart: function () {
      return this.story.blocks[this.index].date_start
    },
    getEnd: function () {
      return this.story.blocks[this.index].date_end
    },
    timeUnit: function () {
      if ((new Date(this.story.blocks[this.index].date_end)) - (new Date(this.story.blocks[this.index].date_start)) <= 86400000) {
        if (this.story.blocks[this.index].interval_unit === 'minute' && this.story.blocks[this.index].date_interval === 15) {
          return 'hour'
        }
      }
      return 'day'
    },
    // Creates either an X or a Y axis label for a chart, depending on the parameters.
    buildLabel: function (axis) {
      if (this.story.blocks.length <= this.index) {
        return ''
      }
      if (axis === 'y') {
        // This axis must contain the units for the given chart.point
        if (this.story.blocks[this.index].charts.length <= this.index) {
          return ''
        }
        const point = this.story.blocks[this.index].charts[0].point
        if (!point) {
          return ''
        }

        if (this.$parent.$options._componentTag === 'sideView') {
          return ''
        }
        return this.$store.getters.mapPoint(point)
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
  .NoData {
    text-align: center;
    color: $--color-white;
    font-weight: 800;
    font-size: 22px;
  }
</style>
