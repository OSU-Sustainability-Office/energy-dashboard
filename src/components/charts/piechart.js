import { Pie, mixins } from 'vue-chartjs';

export default {
  name: 'piechart',
  extends: Pie,
  mixins: [mixins.reactiveProp],
  props: {
    invertColors: Boolean,
  },
  computed: {
    primaryColor: function () {
      return this.invertColors ? 'white' : 'black';
    },
    secondaryColor: function () {
      return this.invertColors ? '#1a1a1a' : '#111';
    },
    options: function () {
      return {
        layout: {
          padding: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
          },
        },
        tooltips: {
          callbacks: {
            title: function (item, data) {
              let d = new Date(item[0].xLabel);
              let meridiem = 'am';
              let hours = d.getHours();
              if (hours > 12) {
                hours -= 12;
                meridiem = 'pm';
              } else if (hours === 0) {
                hours = 12;
              }
              let minutes = d.getMinutes();
              if (minutes < 10) {
                minutes = '0' + minutes;
              }
              let year = d.getYear().toString().slice(1);
              return (
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
              );
            },
            label: (item, data) => {
              return item.yLabel + ' ' + this.$parent.unit();
            },
          },
        },
        legend: {
          labels: {
            fontColor: this.primaryColor,
          },
        },
        title: {
          fontColor: this.primaryColor,
        },
        responsive: true, // my new default options
        maintainAspectRatio: false, // my new default options
      };
    },
  },
  mounted() {
    this.renderChart(this.chartData, this.options);
  },
  watch: {
    // chartData: function(value) {
    // this.renderChart(value);
    // }
  },
  methods: {
    setOptions: function (opts) {
      this.options = opts;
      this.renderChart(this.chartData, this.options);
    },
    update: function () {
      this.$data._chart.update();
    },
  },
};
