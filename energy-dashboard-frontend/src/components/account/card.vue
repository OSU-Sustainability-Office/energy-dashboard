<template>
  <div class="card" v-bind:class="{ feature : featured }">
    {{this.name}}, {{this.description}} {{this.featured}}
    <linechart v-if="featured" ref="chart" v-bind:chartData="chartDataComplete" :style="{ display: 'inline-block', width: '100%' }"/>
    <!-- <linechart v-else ref="chart" v-bind:chartData="data" /> -->
    <featureController v-if="featured" />
  </div>
</template>

<script>

import linechart from '@/components/charts/linechart.js'
import axios from 'axios';
import featureController from '@/components/account/featureController'


export default {
  name: 'card',
  props: ['name', 'description', 'featured', 'id'],
  components: {
    linechart, featureController
  },
  mounted () {
    this.getData('accumulated_real',8,"2018-06-01T00:00:000","2018-06-30T01:00:000",15,"minute");
  },
  data() {
    return {chartData:{},
            chartDataComplete:{},
            updatingChart: false}
  },
  created() {
    
  },
  methods: {
    getData: function (mpoint,groupId,startDate,endDate,interval,unit) {
      if (!this.updatingChart) {
        this.updatingChart = true;
        var promises = [];
        var meterRelation = {};
        this.chartData = {};
        axios.get('http://localhost:3000/api/getMetersForGroup?id='+groupId).then (meters => {
          meters.data.forEach(meter => {
            meterRelation[meter.id.toString()] = meter.operation;
            promises.push(axios.get('http://localhost:3000/api/getMeterData?id='+meter.id+'&date_start='+startDate+'&date_end='+endDate+'&mpoints='+mpoint+'&int='+interval+'&unit='+unit));
          });
          Promise.all(promises).then(values => {
            //combine all returned data
            var combinedData = {};
            values.forEach(value => {
              if (value.data.length === 0) {
                this.updatingChart = false;
                return;
              }
              value.data.forEach(obj => {
                //do the combination operation
                if (obj.time in combinedData) {
                  var time = obj.time;
                  if ("accumulated_real" in obj && meterRelation[obj.meter_id] === 0) {
                    obj.accumulated_real *= -1;
                  }
                  if ("accumulated_real" in combinedData[time])
                    combinedData[time].accumulated_real += obj.accumulated_real;
                }
                else {
                  var time = obj.time;
                  if ("accumulated_real" in obj && meterRelation[obj.meter_id] === 0) {
                    obj.accumulated_real *= -1;
                  }
                  delete obj.time;
                  delete obj.meter_id;
                  combinedData[time] = obj;
                }
              });
            });

            //parse and create the datasets
            this.createDataSets(groupId,combinedData);
            this.parseData(groupId, combinedData);
            this.chartDataComplete = this.chartData;
            this.updatingChart = false;
          }).catch (e => {
            console.log(e);
            //this.errors.push(e);
          });
        }).catch (e => {
          console.log(e);
          //this.errors.push(e);
        });
      }
    },
    createDataSets: function (name,obj) {
      if (!("datasets" in this.chartData))
        this.chartData["datasets"] = [];
      if (!("labels" in this.chartData))
        this.chartData["labels"] = [];
      Object.keys(obj[Object.keys(obj)[0]]).forEach((key,index) => {
        var o = {
          label: (key + " " + name),
          backgroundColor: 'rgba(215,63,9,0.3)',
          borderColor:'#D73F09',
          fill: true,
          showLine: true,
          spanGaps: true,
          data: []
        };
        this.chartData["datasets"].push(o);
      });
    },
    parseData: function (groupId, data) {
      if (!data || !groupId)
        return;
      Object.keys(data).forEach( (key,index) => { //iterate through incoming data object has keys for time, and mpoints, mpoint keys go to
                                                  //data sets time goes to labels
        this.chartData.labels.push(key);
        Object.keys(data[key]).forEach ( (innerKey, innerIndex) => {
          this.chartData.datasets.forEach(dataSet => {
            if (dataSet.label === (innerKey + " " + groupId))
              dataSet.data.push(data[key][innerKey]);
          });
        });
      });
      //shows change per 15 minute interval, this could be added as another function to show a different thing
      //maybe like average change of one month vs another month would be pretty cool to look at
      this.chartData.datasets.forEach(set => {
        var dataCopy = set.data.slice();
        for (var i = 1; i < set.data.length; i++) {
          set.data[i] -= dataCopy[i-1];
        }
        set.data.shift();
      });
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
  padding-right: 2em;
  padding-left: 2em;
  width: 100%;
}
</style>
