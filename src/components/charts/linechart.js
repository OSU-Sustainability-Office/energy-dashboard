/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-11-19T10:40:29-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-02-04T11:32:14-08:00
 */

import { Line, mixins } from 'vue-chartjs'

export default {
  name: 'linechart',
  extends: Line,
  mixins: [mixins.reactiveProp],
  props: [],
  data () {
    return {
      options: {
        elements: {
          point: {
            radius: 3
          }
        },
        tooltips: {
          callbacks: {
            title: function (item, data) {
              let d = new Date(item[0].xLabel)
              let meridiem = 'am'
              let hours = d.getHours()
              if (hours > 12) {
                hours -= 12
                meridiem = 'pm'
              } else if (hours === 0) {
                hours = 12
              }
              let minutes = d.getMinutes()
              if (minutes < 10) {
                minutes = '0' + minutes
              }
              let year = d.getYear().toString().slice(1)
              const dayCodes = [
                'Sun',
                'Mon',
                'Tues',
                'Wed',
                'Thur',
                'Fri',
                'Sat'
              ]
              return (dayCodes[d.getDay()] + ' ' + (d.getMonth() + 1).toString() + '/' + d.getDate() + '/' + year + ' ' + hours + ':' + minutes + ' ' + meridiem)
            },
            label: (item, data) => {
              return this.$parent.chartData.datasets[item.datasetIndex].label + ': ' + parseFloat(item.yLabel).toFixed(2) + ' ' + this.$parent.unit(item.datasetIndex)
            }
          }
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0
          }
        },
        legend: {
          labels: {
            fontSize: 12,
            fontColor: '#FFF',
            fontFamily: 'Open Sans'
          },
          onHover: function (e) {
            e.target.style.cursor = 'pointer'
          }
        },
        hover: {
          onHover: function (e) {
            e.target.style.cursor = 'default'
          }
        },
        title: {
          fontSize: 12,
          fontColor: '#FFF',
          fontFamily: 'Open Sans'
        },
        responsive: true, // my new default options
        maintainAspectRatio: false, // my new default options
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              fontSize: 12,
              fontColor: '#FFF',
              fontFamily: 'Open Sans'
            },
            gridLines: {
              display: true // my new default options
            },
            scaleLabel: {
              display: (this.$parent.buildLabel('y') !== ''),
              labelString: this.$parent.buildLabel('y'),
              fontSize: 12,
              fontColor: '#FFF',
              fontFamily: 'Open Sans'
            }
          }],
          xAxes: [{
            type: 'time',
            bounds: 'data',
            gridLines: {
              display: false
            },
            ticks: {
              fontSize: 14,
              fontColor: '#FFF',
              fontFamily: 'Open Sans',
              autoSkip: true,
              stepSize: 10,
              source: 'data'
            },
            scaleLabel: {
              display: (this.$parent.buildLabel('y') !== ''),
              labelString: this.$parent.buildLabel('x'),
              fontSize: 12,
              fontColor: '#FFF',
              fontFamily: 'Open Sans'
            },
            time: {
              unit: 'day',
              unitStepSize: 15,
              displayFormats: {
                'day': 'M/DD',
                'hour': 'dd h:mm a',
                'minute': 'h:mm a'
              }
            }
          }]
        }
      }
    }
  },
  mounted () {
    this.renderChart(this.chartData, this.options)
  },
  watch: {
    // chartData: function(value) {
    // this.renderChart(value);
    // }
  },
  methods: {
    update: function () {
      this.$data._chart.update()
    },
    setOptions: function (opts) {
      this.options = opts
      this.$data._chart.options = this.options
      // this.renderChart(this.chartData, this.options)
    }
  }
}
