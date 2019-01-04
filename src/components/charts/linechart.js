/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-11-19T10:40:29-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2018-12-21T10:50:40-08:00
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
                'Mon',
                'Tues',
                'Wed',
                'Thur',
                'Fri',
                'Sat',
                'Sun'
              ]
              return (dayCodes[d.getDay()] + ' ' + (d.getMonth() + 1).toString() + '/' + d.getDate() + '/' + year + ' ' + hours + ':' + minutes + ' ' + meridiem)
            },
            label: (item, data) => {
              return item.yLabel + ' ' + this.$parent.unit()
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
            fontColor: 'white'
          }
        },
        title: {
          fontColor: 'white'
        },
        responsive: true, // my new default options
        maintainAspectRatio: false, // my new default options
        scales: {
          yAxes: [{
            ticks: {
              beginAtZero: false,
              fontColor: 'white'
            },
            gridLines: {
              display: true // my new default options
            },
            scaleLabel: {
              display: (this.$parent.buildLabel('y') !== ''),
              labelString: this.$parent.buildLabel('y')
            }
          }],
          xAxes: [{
            gridLines: {
              display: false
            },
            ticks: {
              fontColor: 'white',
              autoSkip: true,
              maxTicksLimit: 30
            },
            scaleLabel: {
              display: (this.$parent.buildLabel('y') !== ''),
              labelString: this.$parent.buildLabel('x')
            },
            type: 'time',
            time: {
              unit: 'hour',
              displayFormats: {
                'hour': 'M/DD'
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
    setOptions: function (opts) {
      this.options = opts
      this.renderChart(this.chartData, this.options)
    },
    update: function () {
      this.$data._chart.update()
    }
  }
}
