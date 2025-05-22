<!--
  Filename: Linechart.vue
  Info: chartJS line chart preset for energy dashboard.
-->

<template>
  <LineChart :key="chartKey" :data="chartData" :options="options" />
</template>

<script>
import { Line as LineChart } from 'vue-chartjs'
import 'chart.js/auto'
import 'chartjs-adapter-luxon'
import { DateTime } from 'luxon'

export default {
  name: 'Linechart',
  components: { LineChart },
  props: {
    invertColors: Boolean,
    yLabel: String,
    xLabel: String,
    chartData: Object,
    isMultipleTimePeriods: Boolean,
    buildXaxisTick: Function,
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
        devicePixelRatio: 2,
        datasets: this.getDatasetOptions(),
        plugins: this.getPluginOptions(),
        elements: this.getElementOptions(),
        layout: this.getLayoutOptions(),
        interaction: this.getInteractionOptions(),
        hover: this.getHoverOptions(),
        responsive: true,
        maintainAspectRatio: false,
        scales: this.getScaleOptions()
      }
    }
  },
  methods: {
    formatXaxisTick: function (val) {
      const dt = DateTime.fromMillis(val)
      switch (this.intervalUnit) {
        case 'month':
          return dt.toFormat('LLL yyyy')
        case 'day':
          return dt.toFormat('M/dd')
        case 'hour':
          return dt.toFormat('ccc h:mm a')
        case 'minute':
          return dt.toFormat('ccc h:mm a')
        default:
          return val
      }
    },
    roundYaxisTick: function (val) {
      // round to 2 decimal places
      return Math.round(val * 100) / 100
    },
    getIntervalUnit: function () {
      // if the interval unit is minute and time frame is too large it breaks the chart, so use day instead
      if (this.intervalUnit === 'minute' && this.getChartTimeFrame() > 7) return 'day'
      else return this.intervalUnit
    },
    // returns how many days are in the chart's time frame, e.g. 7 days, 30 days, etc.
    getChartTimeFrame: function () {
      // for multiple time periods, compare the earliest and latest start/end times
      if (this.isMultipleTimePeriods) {
        const earliestStart = Math.min(...this.chartData.datasets[0].multStart)
        const latestEnd = Math.max(...this.chartData.datasets[0].multEnd)

        const startDate = DateTime.fromMillis(earliestStart)
        const endDate = DateTime.fromMillis(latestEnd)

        return Math.floor(endDate.diff(startDate, 'days').days)
      }

      // for one chart, compare the first and last x date values
      const start = this.chartData.datasets[0].data[0].x
      const end = this.chartData.datasets[0].data[this.chartData.datasets[0].data.length - 1].x
      const dtStart = DateTime.fromJSDate(new Date(start))
      const dtEnd = DateTime.fromJSDate(new Date(end))

      const days = dtEnd.diff(dtStart, 'days').days

      return days
    },
    getDatasetOptions: function () {
      return {
        line: {
          tension: 0.4
        }
      }
    },
    getPluginOptions: function () {
      return {
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
      }
    },
    getElementOptions: function () {
      return {
        point: {
          radius: 3
        }
      }
    },
    getLayoutOptions: function () {
      return {
        padding: {
          left: 0,
          right: 0,
          bottom: 0,
          top: 0
        }
      }
    },
    getInteractionOptions: function () {
      return {
        mode: 'index',
        intersect: true
      }
    },
    getHoverOptions: function () {
      return {
        onHover (event, chartElement) {
          if (chartElement.length) {
            event.native.target.style.cursor = 'pointer'
          } else {
            event.native.target.style.cursor = 'default'
          }
        }
      }
    },
    getScaleOptions: function () {
      return {
        y: {
          beginAtZero: false,
          ticks: {
            font: {
              size: 12,
              family: 'Open Sans'
            },
            color: this.primaryColor,
            autoSkip: true,
            maxTicksLimit: 10,
            callback: (val, index) => {
              return this.roundYaxisTick(val)
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
            display: false
          },
          ticks: {
            source: 'data',
            font: {
              size: 14,
              family: 'Open Sans'
            },
            color: this.primaryColor,
            autoSkip: true,
            // the following three settings change the x-ticks if there are multiple time periods,
            // otherwise the default settings are used
            autoSkipPadding: this.isMultipleTimePeriods ? 15 : 8,
            maxRotation: this.isMultipleTimePeriods ? 0 : 50,
            callback: (val, index) => {
              if (this.isMultipleTimePeriods) {
                return this.buildXaxisTick(index)
              }
              return this.formatXaxisTick(val)
            }
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
            unit: this.getIntervalUnit()
          }
        }
      }
    }
  }
}
</script>
