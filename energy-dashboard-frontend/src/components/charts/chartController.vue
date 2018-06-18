<template>
	<div>
		<linechart v-if="graphType === 1" ref="chart" v-bind:chartData="chartDataComplete" :style="{ 'display': 'inline-block', 'width': '100%', 'padding-right': '1em' }"/>

	</div>
</template>
<script>
import linechart from '@/components/charts/linechart.js';
import axios from 'axios';

export default {
  name: 'card',
  props: ['id','graphType'],
  components: {
    linechart
  },
  mounted () {
    //this.getData('accumulated_real',8,"2018-06-01T00:00:000","2018-06-30T01:00:000",15,"minute");
		// console.log(this.start);
		// for (var i = 0; i < this.groups.length; i++)
		// 	this.getData(i,this.points[i],this.groups[i],this.start,this.end,this.interval,this.unit);
  },
  data() {
    return {
						chartData:{
							datasets: [],
							labels: []
						},
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
		this.$on('requestDownload',e=>{v.$emit('aqquiredData',this.chartDataComplete)});
  },
  methods: {
    getData: function (index,mpoint,groupId,startDate,endDate,interval,unit) {
      if (!this.updatingChart) {
        this.updatingChart = true;
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
					//console.log(meters);
          meters.data.forEach(meter => {
            meterRelation[meter.id.toString()] = meter.operation;
            promises.push(axios.get('http://localhost:3000/api/getMeterData?id='+meter.id+'&date_start='+startDate+'&date_end='+endDate+'&mpoints='+mpoint+'&int='+interval+'&unit='+unit));
					//	console.log(meter.id + " " + startDate + " " + endDate + " " + mpoint + " " + interval + " " + unit);
					});
          Promise.all(promises).then(values => {
						//console.log(values);
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

            this.createDataSet(index,this.names[index],mpoint,intervalCopy,unitCopy,startDate);
						//console.log(this.chartData);
            this.parseData(index, groupId, combinedData);
						this.chartDataComplete = {};
            this.chartDataComplete = this.chartData;
            this.updatingChart = false;
						//this.$refs.chart.destroy();
						this.$refs.chart.update();
						console.log(this.chartDataComplete);
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
    createDataSet: function (index,name,mpoint,interval, unit, start) {

			var o = {
          label: name,
          //backgroundColor: this.colors[index]+"44",
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
			if (index < this.chartData.datasets.length)
				this.chartData["datasets"][index] = o;
			else
				this.chartData.datasets.push(o);
      this.chartData["labels"] = [];
    },
    parseData: function (indexM, groupId, data) {
			//console.log(data);
      if (!data || !groupId)
        return;
      Object.keys(data).forEach( (key,index) => { //iterate through incoming data object has keys for time, and mpoints, mpoint keys go to
                                                  //data sets time goes to labels
        this.chartData.labels.push(key);
				//console.log(key);
        Object.keys(data[key]).forEach ( (innerKey, innerIndex) => {
          // this.chartData.datasets.forEach(dataSet => {
          //   if (dataSet.label === (innerKey + " " + groupId))
          //     dataSet.data.push(data[key][innerKey]);
          // });
					this.chartData.datasets[indexM].data.push(data[key][innerKey]);
        });
      });
      //calculates change per interval (accumulated_real) or average over the interval (every other metering point)
			var set = this.chartData.datasets[indexM];
      //this.chartData.datasets.forEach(set => {
			if (set.mpoint === "accumulated_real") {
        var dataCopy = set.data.slice();
        for (var i = 1; i < set.data.length; i++) {
          set.data[i] -= dataCopy[i-1];
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
				//Format of set.startDate - year-month-dayT:hour:minute:second
				d.setYear(set.startDate.substr(0,4));
				//console.log(set.startDate.substr(5,2));
				d.setMonth(set.startDate.substr(5,2)-1);
				d.setDate(set.startDate.substr(8,2));
				d.setHours(set.startDate.substr(11,2));
				d.setMinutes(set.startDate.substr(14,2));
				d.setSeconds(0);
        for (var i = 1; i < dataCopy.length; i++) {
          if (i % interval === 0 || i === dataCopy.length - 1) {
						addingVariable += dataCopy[i];
						d.setMinutes(d.getMinutes() + interval*15);
						set.data.push({x:d.toString(),y:addingVariable/interval});
						addingVariable = 0;
					}
					else {
						addingVariable += dataCopy[i];
					}
        }
			}
	    //});
    }
  }
}
</script>
