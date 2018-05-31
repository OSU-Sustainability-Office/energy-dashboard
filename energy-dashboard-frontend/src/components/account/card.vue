<template>
  <div class="card" v-bind:class="{ feature : isFeatured }">
    {{this.name}}, {{this.description}} {{this.isFeatured}}
    <linechart v-bind:chartData="data" />
  </div>
</template>

<script>

import linechart from '@/components/charts/linechart.js'
import axios from 'axios';

export default {
  name: 'card',
  props: ['name', 'description', 'isFeatured', 'id', 'data'],
  components: {
    linechart
  },
  created () {
      axios.get('http://localhost:3000/api/getMeterData?id=3&date_start=2018-1-1&date_end=2018-6-1&mpoints=accumulated_real').then (res => {
       this.data = this.parseData(res.data);
     }).catch (e => {
      this.errors.push(e);
     });
     this.chartOptions = {
      width: '100',
      height: '100',
      layout: {
        padding: {
          left: 10,
          right: 10,
          bottom: 10,
          top: 10
        }
      },
      scales: {
        xAxes: [{
          type: 'time',
          time: {
            unit: 'day',
            unitStepSize: 1,
            displayFormats: {
              'day': 'MMM DD'
            }
          }
        }]
      }
     }
     this.$refs.linechart.setOptions(this.chartOptions);
  },
  methods: {
    parseData: function (data) {
      var r = {
        labels: [],
        datasets: []
      };
      if (!data)
        return;
      Object.keys(data[0]).forEach((key,index) => {
        if (key === "time") {
          return;
        }
        var o = {
          label: key,
          backgroundColor: 'rgba(215,63,9,0.3)',
          borderColor:'#D73F09',
          fill: true,
          showLine: true,
          spanGaps: true,
          data: []
        };
        r.datasets.push(o);
      });
      data.forEach( obj => {
        Object.keys(obj).forEach((key,index) => {
          if (key === "time") {
            r.labels.push(obj[key]);
          }
          r.datasets.forEach(set => {
            if (set.label === key)
              set.data.push(obj[key]);
          });
        });
      });
      r.datasets.forEach(set => {
        var dataCopy = set.data.slice();
        for (var i = 1; i < set.data.length; i++) {
          set.data[i] -= dataCopy[i-1];
        }
        set.data.shift();
      })
      return r;
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
  margin-right: 1em;
  margin-top: 1em;
  border: 2px solid #000;
  border-radius: 5px;
  height: 10em;
  min-width: 15em;
}
.feature {
  background: #000;
  height: 30em;
  width: 50%;
}
</style>
