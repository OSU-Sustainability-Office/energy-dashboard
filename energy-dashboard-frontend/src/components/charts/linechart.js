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
              return d.getMonth() + '/' + d.getDate() + '/' + year + ' ' + hours + ':' + minutes + ' ' + meridiem
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
            scaleLabel: {
              display: true,
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
