<template>
  <div class="card featured" v-bind:class="{ feature : featured}" ref='card' v-on:click='unclickText'>

    <chartController v-bind:start='start' v-bind:end='end' v-bind:interval='int' v-bind:unit='unit' v-bind:graphType='type' v-bind:points='points' v-bind:groups='groups' v-bind:names='names' v-bind:submeters='meters' v-if="featured" ref="chartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': '100%','height': '100%', 'padding-right': '2.5em','padding-left':'1.5em','padding-top':'5em' }"/>
    <featureController :start='new Date(start)' :end='new Date(end)' v-bind:interval='int' v-bind:graphType='type' v-bind:unit='unit' v-bind:points='points' v-bind:groupids='groups' v-bind:names='names' v-bind:submeters='meters' v-if="featured" ref="featureController" />
    <div class='titleTextFeatured' v-if="featured" v-on:click='clickText' ref='title' v-tooltip="'Click to edit name'">
      {{this.name}}
    </div>
    <div class="container descriptionContainer" v-if='featured' ref='descriptionContainer'>
      <div class="row">
        <i class="col fas fa-save" v-tooltip="'Save Graph'" @click="save()"></i>
        <i class="col fas fa-download" v-tooltip="'Download Graph Data'" @click="download()"></i>
        <i class="col fas fa-times" @click="del()" v-tooltip="'Delete Graph'"></i>
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
  props: ['story_id','name', 'description', 'featured', 'id','start','end','int','unit','type','media','index', 'points', 'groups', 'names', 'meters'],
  components: {
    chartController, featureController
  },
  data() {
    return {
      showPencil : false,
    }
  },
  methods: {
    setStart: function(val) {
      this.$parent.cards[this.index].date_start = val;
    },
    setEnd: function(val) {
      this.$parent.cards[this.index].date_end = val;
    },
    setType: function(val) {
      this.$refs.chartController.graphType = val;
      this.$parent.cards[this.index].graph_type = val;
    },
    setInt: function(val) {
      this.$parent.cards[this.index].date_interval = val;
    },
    setUnit: function(val) {
      this.$parent.cards[this.index].interval_unit = val;
    },
    setPoints: function(val) {
      this.$parent.cards[this.index].points = val;
    },
    setNames: function(val) {
      this.$parent.cards[this.index].names = val;
    },
    setMeters: function(val) {
      this.$parent.cards[this.index].meters = val;
    },
    setGroups: function(val) {
      this.$parent.cards[this.index].groups = val;
    },
    del: function() {
      this.$parent.del(this.index);
    },
    clickText: function(event) {
      event.target.contentEditable = true;
    },
    unclickText: function(event) {
      if (event.target !== this.$refs.title)
        this.$refs.title.contentEditable = false;
      this.$parent.cards[this.index].name = this.$refs.title.innerText;
    },
    save: function() {
      var card = this.$parent.cards[this.index];
      var groupPoints = [];
      for (var i = 0; i < this.$refs.featureController.groupids.length; i++) {
        groupPoints.push({'id':this.$refs.featureController.groupids[i],'point':this.$refs.featureController.points[i],'name':this.$refs.featureController.names[i],'meter':this.$refs.featureController.submeters[i]});
      }
      var data = {};
      if (card.id)
        data = {
          id: card.id,
          meter_groups: groupPoints,
          date_end: card.date_end,
          date_start: card.date_start,
          graph_type: parseInt(card.graph_type),
          media: card.media,
          descr: card.description,
          name: this.name,
          interval: card.date_interval,
          unit: card.interval_unit
        };
      else
        data = {
          story_id: card.story_id,
          meter_groups: groupPoints,
          date_end: this.end,
          date_start: this.start.toString(),
          graph_type: this.type,
          media: this.media,
          descr: this.description,
          name: this.name,
          interval: this.int,
          unit: this.unit
        };
      axios(process.env.ROOT_API+'api/updateBlock',{method: "post",data:data, withCredentials:true}).then(rid => {
        if (rid.status === 201)
          this.$parent.cards[this.index].id = rid.data;
      }).catch(err => {
        console.log(err);
      });
    },
    download: function() {
      //Get all information contained for current data on the graph
      var points = this.$refs.chartController.points;
      var groups = this.$refs.chartController.groups;
      var names = this.$refs.chartController.names;
      var meters = this.$refs.chartController.submeters;

      var data = [];
      var promises = [];
      var relation = [];

      //Make requests for each meter id in the groups
      for (var i = 0; i < groups.length; i++) {
         promises.push(axios.get(process.env.ROOT_API+'api/getMetersForGroup?id='+groups[i]));
      }


      Promise.all(promises).then(results => {
        var promisesRoundTwo = [];

        results.forEach((row, index) => {
          relation.push({});
          row.data.forEach((meter, meterIndex) => {
            if ((meters[index] === 0 && meter.type == "e") || meter.id == meters[index]) {
              //use relation object to do adding, or subtracting (based on table data)
              relation[index][meter.id] = meter.operation;
              //Make requests for data for each meter
              promisesRoundTwo.push(axios.get(process.env.ROOT_API+'api/getMeterData?id='+meter.id+'&date_start='+this.$refs.chartController.start+'&date_end='+this.$refs.chartController.end+'&mpoints='+points[index]));
            }
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
                  a = Math.abs(a);
                  if (group[key] === 0)
                    a *= -1;


                  if(data[dataIndex]) {
                    while(data[dataIndex][0] > row.time) {
                      dataIndex--;
                      if (!data[dataIndex]) {
                        data[dataIndex] = row.time;
                        break;
                      }
                    }
                  }
                  else {
                    data.push([row.time]);
                  }




                  if(data[dataIndex].length < index+2) {
                    while (data[dataIndex].length < index+2) {
                      data[dataIndex].push(null);
                    }
                    data[dataIndex][index+1] = a;

                  }
                  else {

                    data[dataIndex][index+1] += a;
                  }
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
          console.log(data);
          var blob = new Blob([data.join('\n')]);
          if (window.navigator.msSaveOrOpenBlob)
              window.navigator.msSaveBlob(blob, this.name+".csv");
          else
          {
              var a = window.document.createElement("a");
              a.href = window.URL.createObjectURL(blob, {type: "text/plain"});
              a.download = this.name+".csv";
              document.body.appendChild(a);
              a.click();
              document.body.removeChild(a);
          }
        });
      });

    }
  },
  mounted() {
    this.$nextTick(()=>{
      if (!this.id) {

        this.save();
      }
    });


  },
  created() {
    if (this.id) {
      axios.get(process.env.ROOT_API+'api/getBlockMeterGroups?id='+this.id).then(res => {
        var points = [];
        var names = [];
        var groups = [];
        var meters = [];
        for (var i = 0; i < res.data.length; i++) {
          points.push(res.data[i].point);
          groups.push(res.data[i].group_id);
          names.push(res.data[i].name);
          meters.push(res.data[i].meter);
        }
        this.setGroups(groups);
        this.setPoints(points);
        this.setNames(names);

        this.setMeters(meters);
        this.$nextTick(()=>{

          this.$refs.featureController.mounted = true;
          this.$refs.featureController.updateGraph(true);
        });
      });
    }
    else {


      //this.$nextTick(()=>{
        this.points = ['accumulated_real'];
        this.groups = [8];
        this.names =['New Graph'];
        this.meters = [0];

        this.setPoints(this.points);
        this.setGroups(this.groups);
        this.setNames(this.names);
        this.setMeters(this.meters);
        this.$nextTick(()=>{
          this.$refs.featureController.mounted = true;
          this.$refs.featureController.updateGraph(true);
        });
        //
      //});
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.descriptionContainer {
  position: absolute;
  width: 150px;
  position: absolute;
  left:0px;
  bottom: 0px;

  /* border-radius: 10px 10px 0px 0px;
  transition: bottom 1s;
  background-color: rgba(0,0,0,0.7); */
}
.descriptionContainer .btn {
  background-color: #000;
  color: #fff;
}
.descriptionContainer .row {
  padding: 0.5em;
}
.descriptionContainer .row .col{
  width: 30px;
}
.card {
  margin-left: 0.5%;
  margin-right: 0.5%;
  margin-top: 1em;
  border: 2px solid #000;
  border-radius: 5px;
  height: 10em;

  overflow: hidden;
  width: 250px;
}
.col {
  margin: 0em;
}
.feature {
  background: #000;
  height: 40em;
  padding-right: 2em;
  padding-left: 2em;
  width: 100%;
  flex: 1 1 49%;
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
  color: #FFFFFF99;
  font-size: 2em;
  width: 100%;
  text-align: center;
  display: inline-block;
  cursor: pointer;
}
.storyName {
  color:rgb(215,63,9);
  font-family: 'StratumNo2';
  font-size: 1.8em;
  display: block;
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
  display: block;
  padding-left: 0.3em;
}
</style>
