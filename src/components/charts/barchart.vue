<!--
  Filename: barchart.vue
  Info: chartJS bar chart preset for energy dashboard.
-->

<template>
  <Bar :key="chartKey" :data="chartData" :options="options" />
</template>

<script>
import { Bar } from 'vue-chartjs'
import 'chart.js/auto'
import 'chartjs-adapter-luxon'
import { DateTime } from 'luxon'

export default {
  name: 'barchart',
  components: { Bar },
  props: {
    invertColors: Boolean,
    chartData: Object,
    buildLabel: Function,
    intervalUnit: String
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
              fontSize: 12,
              color: this.primaryColor,
              fontFamily: 'Open Sans'
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
                const originalXlabel = tooltipItems[0].parsed.x
                const d = new Date(originalXlabel || tooltipItems[0].label)
                const dt = DateTime.fromJSDate(d)
                return dt.toFormat('ccc MM/dd/yy h:mm a')
              },
              label: function (tooltipItem) {
                const yLabel = tooltipItem.parsed.y
                const label = tooltipItem.dataset.label
                const unit = tooltipItem.dataset.unit
                return label + ': ' + parseFloat(yLabel).toFixed(2) + ' ' + unit
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
          onHover: function (e) {
            e.target.style.cursor = 'default'
          }
        },
        responsive: true,
        maintainAspectRatio: false,
        scales: {
          y: {
            beginAtZero: false,
            ticks: {
              color: this.primaryColor,
              font: {
                size: 12,
                family: 'Open Sans'
              }
            },
            grid: {
              display: true,
              color: this.secondaryColor
            },
            title: {
              display: this.buildLabel('y') !== '',
              text: this.buildLabel('y'),
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
              display: true,
              color: this.secondaryColor
            },
            ticks: {
              source: 'data',
              color: this.primaryColor,
              font: {
                size: 14,
                family: 'Open Sans'
              },
              autoSkip: true,
              autoSkipPadding: 4
            },
            title: {
              display: this.buildLabel('x') !== '',
              text: this.buildLabel('x'),
              color: this.primaryColor,
              font: {
                size: 12,
                family: 'Open Sans'
              }
            },
            time: {
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
