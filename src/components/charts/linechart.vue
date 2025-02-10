<!--
  Filename: linechart.vue
  Info: chartJS line chart preset for energy dashboard.
-->

<template>
  <Line :key="chartKey" :data="chartData" :options="options" />
</template>

<script>
import { Line } from 'vue-chartjs'
import 'chart.js/auto'
import 'chartjs-adapter-luxon'

export default {
  name: 'linechart',
  components: { Line },
  props: {
    invertColors: Boolean,
    yLabel: String,
    xLabel: String,
    chartData: Object
  },
  data () {
    return {
      chartKey: 0
    }
  },
  watch: {
    chartData: {
      handler: function () {
        this.chartKey++
      }
    }
  },
  computed: {
    primaryColor: function () {
      return this.invertColors ? '#FFF' : '#000'
    },
    secondaryColor: function () {
      return this.invertColors ? '#1a1a1a' : '#111'
    },
    options: function () {
      return {
        devicePixelRatio: 2,
        datasets: {
          line: {
            tension: 0.4
          }
        },
        plugins: {
          title: {
            color: this.primaryColor,
            font: {
              size: 12,
              family: 'Open Sans'
            }
          },
          legend: {
            labels: {
              color: this.primaryColor,
              font: {
                size: 12,
                family: 'Open Sans'
              }
            },
            onHover: e => {
              e.native.target.style.cursor = 'pointer'
            },
            onLeave: e => {
              e.native.target.style.cursor = 'default'
            }
          },
          tooltip: {
            titleColor: '#FFFFFF',
            bodyColor: '#FEFEFE',
            titleFont: { size: 12, family: 'Open Sans' },
            bodyFont: { size: 12, family: 'Open Sans' },
            callbacks: {
              title: function (tooltipItems) {
                // use originalXlabel if it exists, otherwise use the default xLabel
                const originalXlabel = tooltipItems[0].parsed.x
                const d = new Date(originalXlabel || tooltipItems[0].label)
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
                const year = String(d.getFullYear()).slice(-2)
                const dayCodes = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']
                return (
                  dayCodes[d.getDay()] +
                  ' ' +
                  (d.getMonth() + 1).toString() +
                  '/' +
                  d.getDate() +
                  '/' +
                  year +
                  ' ' +
                  hours +
                  ':' +
                  minutes +
                  ' ' +
                  meridiem
                )
              },
              label: function (tooltipItem) {
                const yLabel = tooltipItem.parsed.y
                return (
                  tooltipItem.dataset.label +
                  ': ' +
                  parseFloat(yLabel).toFixed(2) +
                  ' ' +
                  tooltipItem.dataset.unit
                )
              }
            }
          }
        },
        elements: {
          point: {
            radius: 3
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
        interaction: {
          mode: 'index',
          intersect: true
        },
        hover: {
          onHover (event, chartElement) {
            if (chartElement.length) {
              event.native.target.style.cursor = 'pointer'
            } else {
              event.native.target.style.cursor = 'default'
            }
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            ticks: {
              font: {
                size: 12,
                family: 'Open Sans'
              },
              beginAtZero: false,
              color: this.primaryColor,
              autoSkip: true,
              maxTicksLimit: 10,
              callback: (val, index) => {
                return val.toString()
              }
            },
            grid: {
              display: true,
              color: this.primaryColor
            },
            border: {
              color: this.primaryColor
            },
            title: {
              display: this.$parent.buildLabel('y') !== '',
              text: this.$parent.buildLabel('y'),
              color: this.primaryColor,
              font: {
                size: 12,
                family: 'Open Sans'
              }
            }
          },
          x: {
            type: 'time',
            bounds: 'data',
            grid: {
              display: false
            },
            ticks: {
              font: {
                size: 14,
                family: 'Open Sans'
              },
              color: this.primaryColor,
              autoSkip: false,
              // the following three settings change the x-ticks if there are multiple time periods,
              // otherwise the default settings are used
              autoSkipPadding: this.$parent.multipleTimePeriods(this.$parent.chartData.datasets) ? 15 : 4,
              maxRotation: this.$parent.multipleTimePeriods(this.$parent.chartData.datasets) ? 0 : 50,
              beforeBuildTicks: (val, index) => {
                if (this.$parent.multipleTimePeriods(this.$parent.chartData.datasets)) {
                  return this.$parent.buildXaxisTick(index)
                }
                return val
              }
            },
            title: {
              display: this.$parent.buildLabel('x') !== '',
              text: this.$parent.buildLabel('x'),
              color: this.primaryColor,
              font: {
                size: 12,
                family: 'Open Sans'
              }
            },
            time: {
              unit: this.$parent.$store.getters[this.$parent.path + '/intervalUnit'],
              stepSize: 15,
              displayFormats: {
                day: 'MM/dd',
                hour: 'ccc h:mm a',
                minute: 'ccc h:mm a'
              }
            }
          }
        }
      }
    }
  }
}
</script>
