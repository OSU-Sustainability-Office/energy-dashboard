<template>
	<div>
		<linechart v-if="graphType == 1" ref="linechart" v-bind:chartData="chartDataComplete" :style="{ 'display': 'inline-block', 'width': '100%','height': '100%', 'padding-right': '2.5em','padding-left':'1.5em','padding-top':'5em' }"/>
		<barchart v-if="graphType == 2" ref="barchart" v-bind:chartData="chartDataComplete" :style="{ 'display': 'inline-block', 'width': '100%','height': '100%', 'padding-right': '2.5em','padding-left':'1.5em','padding-top':'5em' }" />
		<doughnutchart v-if="graphType == 3" ref="doughnutchart" v-bind:chartData="chartDataComplete" :style="{ 'display': 'inline-block', 'width': '100%','height': '100%', 'padding-right': '2.5em','padding-left':'1.5em','padding-top':'5em' }" />
		<piechart v-if="graphType == 4" ref="piechart" v-bind:chartData="chartDataComplete" :style="{ 'display': 'inline-block', 'width': '100%','height': '100%', 'padding-right': '2.5em','padding-left':'1.5em','padding-top':'5em' }" />
	</div>
</template>
<script>
import linechart from '@/components/charts/linechart.js';
import barchart from '@/components/charts/barchart.js';
import doughnutchart from '@/components/charts/doughnutchart.js';
import piechart from '@/components/charts/piechart.js';

import axios from 'axios';

export default {
  name: 'card',
  props: ['id'],
  components: {
    linechart, barchart, doughnutchart, piechart
  },
  mounted () {
		this.chart = this.$refs.barchart;
  },
  data() {
    return {
						graphType: 1,
						chartData:{
							datasets: [],
							labels: []
						},
						chart: null,
            chartDataComplete:{},
            updatingChart: false,
						groups: [],
						points: [],
						names: [],
						start: null,
						end: null,
						interval: 15,
						unit: "minute",
						colors: ["#4A773C","#00859B","#FFB500","#006A8E","#C4D6A4","#B8DDE1","#FDD26E","#C6DAE7","AA9D2E","#0D5257","#D3832B","#003B5C","#B7A99A","#A7ACA2","#7A6855","#8E9089"]
					}
  },
  created() {

  },
	watch: {
		graphType: function (value) {
			if (value == 1) {
				this.chart = this.$refs.linechart;
			}
			else if (value == 2) {
				this.chart = this.$refs.barchart;
			}
			else if (value == 3) {
				this.chart = this.$refs.doughnutchart;
			}
			else if (value == 4) {
				this.chart = this.$refs.piechart;
			}
			var promises = [];

			for (var i = 0; i < this.groups.length; i++) {
				promises.push(this.getData(i,this.points[i],this.groups[i],this.start,this.end, this.interval, this.unit));
			}
			Promise.all(promises).then(() => {
				this.updateChart();
			});
		}
	},
  methods: {
    getData: function (index,mpoint,groupId,startDate,endDate,interval,unit) {
			return new Promise((fulfill, reject) => {
	        var promises = [];
	        var meterRelation = {};
					//we need to average the values over intervals for everything but accumulated real
					var intervalCopy = interval;
					var unitCopy = unit;
					if (mpoint !== "accumulated_real") {
						interval = '15';
						unit = 'minute';
					}
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
							if (this.graphType == 1 || this.graphType == 2) {
								this.createDataSet(index,this.names[index],mpoint,intervalCopy,unitCopy,startDate);
	            	this.parseDataBarLine(index, groupId, combinedData);
							}
							else if(this.graphType == 3 || this.graphType == 4)
								this.parseDataPieDoughnut(index, groupId, combinedData);

	            this.chartDataComplete = JSON.parse(JSON.stringify(this.chartData));

							fulfill();
	          }).catch (e => {
	            console.log(e);
							reject(e);
	          });
	        }).catch (e => {
	          console.log(e);
						reject(e);
	        });
			});
    },
		updateChart: function() {
			if (this.chart)
				this.chart.update();
		},
    createDataSet: function (index,name,mpoint,interval, unit, start) {
			if (this.chartData.datasets[0] && !this.chartData.datasets[0].mpoint) {
				this.chartData = {
					datasets: [],
					labels: []
				};
			}

			var o = {
          label: name,
          backgroundColor: this.colors[index],
          borderColor: this.colors[index],
          fill: false,
					mpoint: mpoint,
					interval: interval,
					startDate: start,
					unit: unit,
          showLine: true,
          spanGaps: true,
          data: []
      };
			if (this.graphType === 1) {
				o.backgroundColor = this.colors[index]+"44";
				o.borderColor = this.colors[index];
			}
			if (index < this.chartData.datasets.length)
				this.chartData["datasets"][index] = o;
			else
				this.chartData.datasets.push(o);
			//console.log(JSON.parse(JSON.stringify(this.chartData)));
    },
		parseDataPieDoughnut: function (indexM, groupId, data) {
			if (!data || !groupId)
				return;
			if ( !this.chartData.datasets[0] || !this.chartData.datasets[0].data || this.chartData.datasets[0].mpoint) {
				this.chartData = {
					labels : [],
					datasets: [{
						data: []
					}]
				};
				this.chartData.datasets[0].backgroundColor = this.colors;
			}

			this.chartData.datasets[0].data[indexM] = 0;

			this.chartData.labels[indexM] = this.names[indexM];
			var kArray = Object.keys(data);
			if (kArray.length === 0)
				return;

			var innerKey = Object.keys(data[kArray[0]])[0];
			this.chartData.datasets[0].data[indexM] = data[kArray[kArray.length-1]][innerKey] - data[kArray[0]][innerKey];

		},
    parseDataBarLine: function (indexM, groupId, data) {
			//console.log(data);
      if (!data || !groupId)
        return;
			//Eventually this should be changed to assume that only one mpoint is called from the api
      Object.keys(data).forEach( (key,index) => { //iterate through incoming data object has keys for time, and mpoints, mpoint keys go to
                                                  //data sets time goes to labels

        Object.keys(data[key]).forEach ( (innerKey, innerIndex) => {
					this.chartData.datasets[indexM].data.push({x:key,y:data[key][innerKey]});
        });
      });
      //calculates change per interval (accumulated_real) or average over the interval (every other metering point)
			var set = this.chartData.datasets[indexM];
			if (set.mpoint === "accumulated_real") {

				//deep copy object array
        var dataCopy = JSON.parse(JSON.stringify(set.data));

        for (var i = 1; i < set.data.length; i++) {
					var b = i - 1;
					var lastCounted = dataCopy[b].y;
					while (!lastCounted)
						lastCounted = dataCopy[--b].y;
					if(dataCopy[i].y) {
						set.data[i].y -= lastCounted;
						var d = new Date(set.data[i].x);
						set.data[i].x = d;
					}

        }
        set.data.shift();
			}
			else {
				var dataCopy = set.data.slice();
				set.data = [];
				var interval = set.interval;
				if (set.unit === "hour") {
					interval *= 60;
				}
				else if (set.unit === "day") {
					interval *= 1440;
				}
				else if (set.unit === "month") {
					interval *= 43800;
				}
				interval /= 15;
				var addingVariable = 0;
				var d = new Date();
				d.setYear(set.startDate.substr(0,4));
				d.setMonth(set.startDate.substr(5,2)-1);
				d.setDate(set.startDate.substr(8,2));
				d.setHours(set.startDate.substr(11,2));
				d.setMinutes(set.startDate.substr(14,2)-d.getTimezoneOffset());
				d.setSeconds(0);
        for (var i = 1; i < dataCopy.length; i++) {
          if (i % interval === 0 || i === dataCopy.length - 1) {
						addingVariable += dataCopy[i].y;

						d.setMinutes(d.getMinutes() + interval*15);
						var b = new Date(d);
						set.data.push({x:b,y:addingVariable/interval});
						addingVariable = 0;
					}
					else {
						addingVariable += dataCopy[i].y;
					}
        }
			}
	    //});
    }
  }
}
</script>
