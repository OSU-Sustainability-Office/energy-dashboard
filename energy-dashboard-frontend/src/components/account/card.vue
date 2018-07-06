<template>
  <div class="card" v-bind:class="{ feature : featured }" ref='card' >
    <!-- <div v-bind:class="{ 'titleText' : !featured, 'titleTextFeatured' : featured}">
      {{this.name}}
    </div> -->
    <!-- <img :src="media" /> -->
    <!-- <linechart v-if="featured" ref="chart" v-bind:chartData="chartDataComplete" :style="{ display: 'inline-block', width: '100%' }"/> -->
    <!-- <linechart v-else ref="chart" v-bind:chartData="data" /> -->
    <chartController v-if="featured" ref="chartController" :graphType='1' class="chart"/>
    <featureController v-if="featured" ref="featureController" />

    <div class="container descriptionContainer" v-if='featured'>
      <div class='titleTextFeatured row'>
        {{this.name}}
      </div>
      <div class='descriptionTextFeatured row'>
        {{this.description}}
      </div>
      <div class="row">
        <btn @click="download()" v-if="featured" ref="downloadBtn">Download Data</btn>
      </div>
    </div>
  </div>
</template>

<script>

import chartController from '@/components/charts/chartController'
import axios from 'axios';
import featureController from '@/components/account/featureController'


export default {
  name: 'card',
  props: ['name', 'description', 'featured', 'id','start','end','int','unit','type','media'],
  components: {
    chartController, featureController
  },
  methods: {
    download: function() {
      var points = this.$refs.featureController.points;
      var groups = this.$refs.featureController.groupids;
      var names = this.$refs.featureController.names;
      var data = [];
      var promises = [];
      var relation = [];
      for (var i = 0; i < groups.length; i++) {
         promises.push(axios.get('http://localhost:3000/api/getMetersForGroup?id='+groups[i]));
      }

      Promise.all(promises).then(results => {
        var promisesRoundTwo = [];
        results.forEach((row, index) => {
          relation.push({});
          row.data.forEach((meter, meterIndex) => {
            relation[index][meter.id] = meter.operation;
            promisesRoundTwo.push(axios.get('http://localhost:3000/api/getMeterData?id='+meter.id+'&date_start='+this.$refs.featureController.dateFrom+'&date_end='+this.$refs.featureController.dateTo+'&mpoints='+points[index]));
          });
        });
        Promise.all(promisesRoundTwo).then(results => {
          data.push(["Time"]);
          points.forEach((point,index) => {
            data[0].push(names[index]);
          });
          var resultEnumerator = 0;
          relation.forEach((group,index) => {
            if (points[index] === 'accumulated_real') {
              var dataIndex = 1;
              Object.keys(group).forEach((key) => {
                dataIndex = 1;
                results[resultEnumerator].data.forEach( (row, rowIndex) => {
                  var a = row[points[index]];
                  if (group[key] === 0)
                    a *= -1;
                  if(!data[dataIndex])
                    data.push([row.time]);
                  if(!data[dataIndex][index+1])
                    data[dataIndex].push(a);
                  else
                    data[dataIndex][index+1] += a;
                  dataIndex++;
                });
                resultEnumerator++;
              });
            }
            else {
              results[resultEnumerator].data.forEach( (row, rowIndex) => {
                if (!data[rowIndex+1])
                  data.push([row.time]);
                data[rowIndex+1].push(row[points[index]]);
              });
              resultEnumerator += Object.keys(group).length;
            }

          });
          // var dataCopy =
          // for (var i = 0; i < data.length; i++) {
          //   data[i] = data[i].join(',');
          // }
          // data = data.join('\n');
          //console.log(data);
          var blob = new Blob([data.join('\n')]);
          if (window.navigator.msSaveOrOpenBlob)
              window.navigator.msSaveBlob(blob, "data.csv");
          else
          {
              var a = window.document.createElement("a");
              a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
              a.download = "data.csv";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
          }
        });
      });




      // .then (meters => {
      //      var promises = [];
      //      var meterRelation = {}
      //      meters.data.forEach(meter => {
      //        meterRelation[meter.id.toString()] = meter.operation;
      //        promises.push(axios.get('http://localhost:3000/api/getMeterData?id='+meter.id+'&date_start='+this.$refs.featureController.dateFrom+'&date_end='+this.$refs.featureController.dateFrom+'&mpoints='+points[i]));
      //      });
      //      Promise.all(promises).then(results => {
      //        if (points[i] === "accumulated_real") {
      //
      //        }
      //        else {
      //          results.forEach(row => {
      //            if (!data[row.data.time]) {
      //              data[row.data.time] = {};
      //            }
      //            data[row.data.time][names[i]] = row.data[points[i]];
      //          });
      //        }
      //      });
      //    });
      // }



    },
  },
  mounted() {
    this.$refs.card.style.background = "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)),url('"+this.media+"')";
    this.$refs.card.style.backgroundSize = "cover";
    if (this.featured) {
      this.$refs.featureController.dateFrom = this.start;
      this.$refs.featureController.dateTo = this.end;
      this.$refs.featureController.interval = this.int;
      this.$refs.featureController.graphType = this.type;
      this.$refs.featureController.unit = this.unit;

      this.$refs.chartController.start = this.start;
      this.$refs.chartController.end = this.end;
      this.$refs.chartController.interval = this.int;
      this.$refs.chartController.graphType = this.type;
      this.$refs.chartController.unit = this.unit;

      axios.get('http://localhost:3000/api/getBlockMeterGroups?id='+this.id).then (res => {
        //this.$refs.chartController = res.data;
        for (var i = 0; i < res.data.length; i++) {
          this.$refs.featureController.points.push(res.data[i].point);
          this.$refs.featureController.groupids.push(res.data[i].group_id);
          this.$refs.featureController.names.push(res.data[i].name);

          this.$refs.chartController.points.push(res.data[i].point);
          this.$refs.chartController.groups.push(res.data[i].group_id);
          this.$refs.chartController.names.push(res.data[i].name);

          //Need to update the graph right here
        }
        this.$refs.featureController.updateGraph()
      });
    }
  }
  // watch: {
  //
  // }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.descriptionContainer {
  position: absolute;
  left: 0px;
  height: 100%;
  width: 20%;
  background-color: rgba(0,0,0,0.7);
}
.descriptionContainer .btn {
  background-color: #000;
  color: #fff;
}
.descriptionContainer .row {
  padding: 1em;
}
.card {
  margin-right: 1em;
  margin-top: 1em;
  border: 2px solid #000;
  border-radius: 5px;
  height: 10em;
  min-width: 15em;
  overflow: hidden;
  background: url
}
.feature {
  background: #000;
  height: 40em;
  padding-right: 2em;
  padding-left: 2em;
  width: 100%;
}
.titleTextFeatured {
  color: rgb(215,63,9);
  font-size: 2em;
  font-family: 'StratumNo2';
}
.descriptionTextFeatured {
  color: rgb(255,255,255);

}
</style>
