/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-11-19T10:40:29-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-02-04T11:32:29-08:00
 */

import { Bar, mixins } from 'vue-chartjs'
export default {
  name: 'barchart',
  extends: Bar,
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
              return parseFloat(item.yLabel).toFixed(2) + ' ' + this.$parent.unit()
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
              beginAtZero: true,
              fontSize: 12,
              fontColor: '#FFF',
              fontFamily: 'Open Sans'
              // min: 20 Need to caclulate this value so there arent any blank lines
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
            gridLines: {
              display: false
            },
            ticks: {
              fontSize: 12,
              fontColor: '#FFF',
              fontFamily: 'Open Sans',
              autoSkip: true
            },
            scaleLabel: {
              display: (this.$parent.buildLabel('y') !== ''),
              labelString: this.$parent.buildLabel('x'),
              fontSize: 12,
              fontColor: '#FFF',
              fontFamily: 'Open Sans'
            },
            type: 'time',
            time: {
              unit: 'day',
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
