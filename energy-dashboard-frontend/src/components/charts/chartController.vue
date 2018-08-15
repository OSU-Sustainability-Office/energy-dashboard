<template>
  <div>
    <linechart v-if="graphType == 1" ref="linechart" v-bind:chartData="chartDataComplete" :style="styleC"/>
    <barchart v-if="graphType == 2" ref="barchart" v-bind:chartData="chartDataComplete" :style="styleC" />
    <doughnutchart v-if="graphType == 3" ref="doughnutchart" v-bind:chartData="chartDataComplete" :style="styleC" />
    <piechart v-if="graphType == 4" ref="piechart" v-bind:chartData="chartDataComplete" :style="styleC" />
  </div>
</template>
<script>
import linechart from '@/components/charts/linechart.js'
import barchart from '@/components/charts/barchart.js'
import doughnutchart from '@/components/charts/doughnutchart.js'
import piechart from '@/components/charts/piechart.js'

import axios from 'axios'

export default {
  name: 'card',
  props: ['start', 'end', 'interval', 'submeters', 'groups', 'points', 'names', 'unit', 'graphType', 'styleC', 'randomColors'],
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
      chart: null,
      chartDataComplete: {},
      indexesInUse: [],
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
      let promises = []
      for (let i = 0; i < this.groups.length; i++) {
        promises.push(this.getData(i, this.points[i], this.groups[i], this.start, this.end, this.interval, this.unit, this.submeters[i]))
      }
      Promise.all(promises).then(() => {
        this.updateChart()
      }).catch(e => { console.log(e) })
    }
  },
  methods: {
    getData: function (index, mpoint, groupId, startDate, endDate, interval, unit, submeter) {
      // console.log(index + ' ' + mpoint + ' ' + groupId + ' ' + startDate + ' ' + endDate + ' ' + interval + ' ' + unit + ' ' + submeter);
      return new Promise((resolve, reject) => {
        if (this.indexesInUse.includes(index)) {
          reject(new Error('Index in use'))
          return
        }
        this.indexesInUse.push(index)
        let promises = []
        let meterRelation = {}
        // we need to average the values over intervals for everything but accumulated real
        let intervalCopy = interval
        let unitCopy = unit
        if (mpoint !== 'accumulated_real' && mpoint !== 'total' && mpoint !== 'cubic_feet') {
          interval = '15'
          unit = 'minute'
        }
        axios.get(process.env.ROOT_API + 'api/getMetersForGroup?id=' + groupId).then(meters => {
          meters.data.forEach(meter => {
            if (submeter === 0 || submeter === meter.id) {
              if ((submeter === 0 && meter.type === 'e') || submeter !== 0) {
                meterRelation[meter.id.toString()] = meter.operation
                promises.push(axios.get(process.env.ROOT_API + 'api/getMeterData?id=' + meter.id + '&date_start=' + startDate + '&date_end=' + endDate + '&mpoints=' + mpoint + '&int=' + interval + '&unit=' + unit))
              }
            }
          })
          Promise.all(promises).then(values => {
            var cbf = () => {
              if (index !== this.indexesInUse[0]) {
                setTimeout(cbf, 10)
                return
              }
              let combinedData = {}
              if (values.length === 0) { return }
              values.forEach(value => {
                if (value.status === 400 || value.data.length === 0) {
                  return
                }
                value.data.forEach(obj => {
                  // do the combination operation
                  if ('accumulated_real' in obj) {
                    obj.accumulated_real = Math.abs(obj.accumulated_real)
                  }
                  if (obj.time in combinedData) {
                    let time = obj.time
                    if ('accumulated_real' in obj && meterRelation[obj.meter_id] === 0 && submeter === 0) {
                      obj.accumulated_real *= -1
                    }
                    if ('accumulated_real' in combinedData[time]) {
                      combinedData[time].accumulated_real += obj.accumulated_real
                    }
                  } else {
                    let time = obj.time
                    if ('accumulated_real' in obj && meterRelation[obj.meter_id] === 0 && submeter === 0) {
                      obj.accumulated_real *= -1
                    }
                    delete obj.time
                    delete obj.meter_id
                    combinedData[time] = obj
                  }
                })
              })
              // parse and create the datasets
              if (this.graphType === 1 || this.graphType === 2) {
                this.createDataSet(index, this.names[index], mpoint, intervalCopy, unitCopy, startDate)
                // console.log(JSON.parse(JSON.stringify(this.chartData)));
                // console.log(index);
                this.parseDataBarLine(index, groupId, combinedData)
              } else if (this.graphType === 3 || this.graphType === 4) {
                this.parseDataPieDoughnut(index, groupId, combinedData)
              }
              this.indexesInUse.splice(this.indexesInUse.indexOf(index), 1)

              if (this.indexesInUse.length === 0) { // Update all at once instead of one after another
                this.chartDataComplete = JSON.parse(JSON.stringify(this.chartData))
                console.log(this.chartData)
              }

              resolve()
            }
            setTimeout(cbf, 10)
          }).catch(e => {
            this.indexesInUse.splice(this.indexesInUse.indexOf(index), 1)
            console.log(e)
            reject(e)
          })
        }).catch(e => {
          this.indexesInUse.splice(this.indexesInUse.indexOf(index), 1)
          console.log(e)
          reject(e)
        })
      })
    },
    updateChart: function () {
      if (this.chart) { this.chart.update() }
    },
    createDataSet: function (index, name, mpoint, interval, unit, start) {
      if (this.chartData.datasets[0] && !this.chartData.datasets[0].mpoint) {
        this.chartData = {
          datasets: [],
          labels: []
        }
      }

      let o = {
        label: name,
        backgroundColor: this.colors[index],
        borderColor: this.colors[index],
        fill: false,
        mpoint: mpoint,
        interval: interval,
        startDate: start,
        unit: unit,
        showLine: true,
        spanGaps: true,
        data: []
      }
      if (this.graphType === 1) {
        o.backgroundColor = this.colors[index] + '44'
        o.borderColor = this.colors[index]
      }
      if (index < this.chartData.datasets.length) {
        this.chartData['datasets'][index] = o
      } else {
        this.chartData.datasets.push(o)
      }
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
    parseDataBarLine: function (indexM, groupId, data) {
      if (!data || !groupId) { return }
      // Eventually this should be changed to assume that only one mpoint is called from the api
      Object.keys(data).forEach((key, index) => { // iterate through incoming data object has keys for time, and mpoints, mpoint keys go to data sets time goes to labels
        Object.keys(data[key]).forEach((innerKey, innerIndex) => {
          this.chartData.datasets[indexM].data.push({ x: key, y: data[key][innerKey] })
        })
      })
      // calculates change per interval (accumulated_real) or average over the interval (every other metering point)
      var set = this.chartData.datasets[indexM]
      if (set.mpoint === 'accumulated_real' || set.mpoint === 'cubic_feet' || set.mpoint === 'total') {
        // deep copy object array
        let dataCopy = JSON.parse(JSON.stringify(set.data))

        for (let i = 1; i < set.data.length; i++) {
          let b = i - 1
          let lastCounted = dataCopy[b].y
          while (!lastCounted) { lastCounted = dataCopy[--b].y }
          if (dataCopy[i].y) {
            set.data[i].y -= lastCounted
            let d = new Date(set.data[i].x)
            set.data[i].x = d
          }
        }
        set.data.shift()
      } else {
        let dataCopy = set.data.slice()
        set.data = []
        let interval = set.interval
        if (set.unit === 'hour') {
          interval *= 60
        } else if (set.unit === 'day') {
          interval *= 1440
        } else if (set.unit === 'month') {
          interval *= 43800
        }
        interval /= 15
        let addingVariable = 0
        let d = new Date()
        d.setYear(set.startDate.substr(0, 4))
        d.setMonth(set.startDate.substr(5, 2) - 1)
        d.setDate(set.startDate.substr(8, 2))
        d.setHours(set.startDate.substr(11, 2))
        d.setMinutes(set.startDate.substr(14, 2) - d.getTimezoneOffset())
        d.setSeconds(0)
        for (let i = 1; i < dataCopy.length; i++) {
          if (i % interval === 0 || i === dataCopy.length - 1) {
            addingVariable += dataCopy[i].y

            d.setMinutes(d.getMinutes() + interval * 15)
            let b = new Date(d)
            set.data.push({ x: b, y: addingVariable / interval })
            addingVariable = 0
          } else {
            addingVariable += dataCopy[i].y
          }
        }
      }
    }
  }
}
</script>
