<template>
  <div class="card" v-bind:class="{ feature : featured}" ref='card' >
    <div class="storyCard" v-if='!featured'>
      <span class="storyName" v-if='!featured'>{{this.name}}</span>
      <span class="storyDescription" v-if='!featured'>{{this.description}}</span>
    </div>

    <chartController v-if="featured" ref="chartController" :graphType='1' class="chart"/>
    <featureController v-if="featured" ref="featureController" />
    <div class='titleTextFeatured' v-if="featured">
      {{this.name}}
    </div>
    <div class="container descriptionContainer" v-if='featured' ref='descriptionContainer'>
      <div class="row" v-on:click='isMaximized = !isMaximized'>
        <i class="fas" v-bind:class="{ 'fa-chevron-circle-up' : !isMaximized, 'fa-chevron-circle-down' : isMaximized }"></i>
      </div>
      <div class='descriptionTextFeatured row' v-if='this.description'>
        {{this.description}}
      </div>
      <div class="row">
        <btn class="col" @click="download()" v-if="featured" ref="downloadBtn">Download Data</btn>
        <btn class="col" @click="save()" v-if="featured" ref="downloadBtn">Save Chart</btn>
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
  data() {
    return {
      isMaximized : false
    }
  },
  methods: {
    download: function() {
      //Get all information contained for current data on the graph
      var points = this.$refs.featureController.points;
      var groups = this.$refs.featureController.groupids;
      var names = this.$refs.featureController.names;

      var data = [];
      var promises = [];
      var relation = [];

      //Make requests for each meter id in the groups
      for (var i = 0; i < groups.length; i++) {
         promises.push(axios.get('http://localhost:3000/api/getMetersForGroup?id='+groups[i]));
      }


      Promise.all(promises).then(results => {
        var promisesRoundTwo = [];
        results.forEach((row, index) => {
          relation.push({});
          row.data.forEach((meter, meterIndex) => {
            //use relation object to do adding, or subtracting (based on table data)
            relation[index][meter.id] = meter.operation;
            //Make requests for data for each meter
            promisesRoundTwo.push(axios.get('http://localhost:3000/api/getMeterData?id='+meter.id+'&date_start='+this.$refs.featureController.dateFrom+'&date_end='+this.$refs.featureController.dateTo+'&mpoints='+points[index]));
          });
        });
        Promise.all(promisesRoundTwo).then(results => {
          //Push the titles of the table to the CSV
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

    },
  },
  mounted() {
    //this.$refs.card.style.background = "linear-gradient(rgba(0, 0, 0, 0.75), rgba(0, 0, 0, 0.75)),url('"+this.media+"')";
    this.$refs.card.style.backgroundColor = 'rgb(26,26,26)';
    if (this.featured) {
      this.$refs.descriptionContainer.style.bottom = "calc(3.5em - " + this.$refs.descriptionContainer.clientHeight.toString() + "px)";
    }

    //this.$refs.card.style.backgroundSize = "cover";
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
      if (this.id)
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
      else {
        this.$refs.featureController.points.push("accumulated_real");
        this.$refs.featureController.groupids.push(8);
        this.$refs.featureController.names.push("New Graph");
      }
    }
  },
  watch: {
    isMaximized : function(value) {
      if (value) {
        this.$refs.descriptionContainer.style.bottom = "0px";
      }
      else {
        this.$refs.descriptionContainer.style.bottom = "calc(3.5em - " + this.$refs.descriptionContainer.clientHeight.toString() + "px)";
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.descriptionContainer {
  position: absolute;
  left: 0px;
  width: 80%;
  position: absolute;
  bottom: 0px;
  left: 10%;
  border-radius: 10px 10px 0px 0px;
  transition: bottom 1s;
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
  margin-left: 0.5%;
  margin-right: 0.5%;
  margin-top: 1em;
  border: 2px solid #000;
  border-radius: 5px;
  height: 10em;
  flex: 1 1 49%;
  overflow: hidden;
}
.col {
  margin: 0.5em;
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
  position: absolute;
  padding-top: 0.3em;
}
.descriptionTextFeatured {
  color: rgb(255,255,255);

}
.fas {
  color: #FFF;
  font-size: 2em;
  width: 100%;
  text-align: center;
}
.storyName {
  color:rgb(215,63,9);
  font-family: 'StratumNo2';
  font-size: 1.8em;
}
.storyCard {
  padding: 1em;
  border: 2.5px solid rgb(215,63,9);
  height: 100%;
  width: 100%;
}
.storyDescription {
  color: #FFF;
  font-family: 'StratumNo2';
  font-size: 1.2em;
}
</style>
