/**
 * @Author: Brogan Miner <Brogan>
 * @Date:   2018-11-19T10:40:29-08:00
 * @Email:  brogan.miner@oregonstate.edu
 * @Last modified by:   Brogan
 * @Last modified time: 2019-02-11T10:04:11-08:00
 */

import { Bar, mixins } from 'vue-chartjs';
export default {
  name: 'barchart',
  extends: Bar,
  mixins: [mixins.reactiveProp],
  props: {
    invertColors: Boolean,
  },
  computed: {
    primaryColor: function () {
      return this.invertColors ? '#FFF' : '#000';
    },
    secondaryColor: function () {
      return this.invertColors ? '#1a1a1a' : '#111';
    },
    options: function () {
      return {
        elements: {
          point: {
            radius: 3,
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
              const dayCodes = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat'];
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
              );
            },
            label: (item, data) => {
              return (
                this.$parent.chartData.datasets[item.datasetIndex].label +
                ': ' +
                parseFloat(item.yLabel).toFixed(2) +
                ' ' +
                this.$parent.unit(item.datasetIndex)
              );
            },
          },
        },
        layout: {
          padding: {
            left: 0,
            right: 0,
            bottom: 0,
            top: 0,
          },
        },
        legend: {
          labels: {
            fontSize: 12,
            fontColor: this.primaryColor,
            fontFamily: 'Open Sans',
          },
          onHover: function (e) {
            e.target.style.cursor = 'pointer';
          },
        },
        hover: {
          onHover: function (e) {
            e.target.style.cursor = 'default';
          },
        },
        title: {
          fontSize: 12,
          fontColor: this.primaryColor,
          fontFamily: 'Open Sans',
        },
        responsive: true, // my new default options
        maintainAspectRatio: false, // my new default options
        scales: {
          yAxes: [
            {
              ticks: {
                beginAtZero: false,
                fontSize: 12,
                fontColor: this.primaryColor,
                fontFamily: 'Open Sans',
              },
              gridLines: {
                display: true, // my new default options
                color: this.secondaryColor,
              },
              scaleLabel: {
                display: this.$parent.buildLabel('y') !== '',
                labelString: this.$parent.buildLabel('y'),
                fontSize: 12,
                fontColor: this.primaryColor,
                fontFamily: 'Open Sans',
              },
            },
          ],
          xAxes: [
            {
              type: 'time',
              bounds: 'data',
              gridLines: {
                display: true, // my new default options
                color: this.secondaryColor,
              },
              ticks: {
                fontSize: 14,
                fontColor: this.primaryColor,
                fontFamily: 'Open Sans',
                autoSkip: true,
                stepSize: 10,
                source: 'data',
              },
              scaleLabel: {
                display: this.$parent.buildLabel('y') !== '',
                labelString: this.$parent.buildLabel('x'),
                fontSize: 12,
                fontColor: this.primaryColor,
                fontFamily: 'Open Sans',
              },
              time: {
                unit: 'day',
                unitStepSize: 15,
                displayFormats: {
                  day: 'M/DD',
                  hour: 'dd h:mm a',
                  minute: 'h:mm a',
                },
              },
            },
          ],
        },
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
      this.$data._chart.options = this.options;
      // this.renderChart(this.chartData, this.options)
    },
    update: function () {
      this.$data._chart.update();
    },
  },
};
