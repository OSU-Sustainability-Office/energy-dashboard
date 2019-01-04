import { Bar, mixins } from 'vue-chartjs'
export default {
  name: 'barchart',
  extends: Bar,
  mixins: [mixins.reactiveProp],
  props: [],
  data () {
    return {
      options: {
        layout: {
          padding: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0
          }
        },
        tooltips: {
          callbacks: {
            title: function (item, data) {
              let d = new Date(item[0].xLabel)
              d.setTime(d.getTime() - d.getTimezoneOffset() * 60 * 1000)
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
              return (d.getMonth() + 1).toString() + '/' + d.getDate() + '/' + year + ' ' + hours + ':' + minutes + ' ' + meridiem
            },
            label: (item, data) => {
              return item.yLabel + ' ' + this.$parent.unit()
            }
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
              display: true, // my new default options
              color: 'rgba(255, 255, 255, 0.1)'
            },
            scaleLabel: {
              display: true,
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
            type: 'time',
            time: {
              unit: 'hour',
              unitStepSize: 12,
              displayFormats: {
                'hour': 'M/DD h:00 a'
              }
            },
            scaleLabel: {
              display: true,
              labelString: this.$parent.buildLabel('x')
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
