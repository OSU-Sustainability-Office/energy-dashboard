import { Doughnut, mixins } from 'vue-chartjs'

export default {
  name: 'doughnutchart',
  extends: Doughnut,
  mixins: [mixins.reactiveProp],
  props: {
    invertColors: Boolean
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
            title: ( item, data ) => {
              return data.labels[item[0].index]
              // return ''
            },
            label: ( item, data ) => {
              return (
                data.datasets[0].data[item.index] +
                ' ' +
                this.$parent.unit( item.index )
              )
            },
            footer: ( item, data ) => {
              let start = new Date( this.$parent.dateStart )
              let end = new Date( this.$parent.dateEnd )

              return this.formatDate( start ) + ' - ' + this.formatDate( end )
            }
          }
        },
        legend: {
          labels: {
            fontColor: this.primaryColor
          }
        },
        title: {
          fontColor: this.primaryColor
        },
        responsive: true, // my new default options
        maintainAspectRatio: false // my new default options
      }
    }
  },
  mounted () {
    this.renderChart( this.chartData, this.options )
  },
  methods: {
    setOptions: function ( opts ) {
      this.options = opts
      this.renderChart( this.chartData, this.options )
    },
    update: function () {
      this.$data._chart.update()
    },
    formatDate: function ( d ) {
      d.setTime( d.getTime() - d.getTimezoneOffset() * 60 * 1000 )
      let meridiem = 'am'
      let hours = d.getHours()
      if ( hours > 12 ) {
        hours -= 12
        meridiem = 'pm'
      } else if ( hours === 0 ) {
        hours = 12
      }
      let minutes = d.getMinutes()
      if ( minutes < 10 ) {
        minutes = '0' + minutes
      }
      let year = d.getYear().toString().slice( 1 )
      return (
        ( d.getMonth() + 1 ).toString() +
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
    }
  }
}
