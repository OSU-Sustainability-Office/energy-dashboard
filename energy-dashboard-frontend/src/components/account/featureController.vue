<template>
  <div class="controlSection">
    <div class="expand">
      <i class="fas" v-on:click="isMaximized = !isMaximized" v-bind:class="{ 'fa-chevron-circle-left' : !isMaximized, 'fa-chevron-circle-right' : isMaximized }"></i>
    </div>
    <div class="controls">
    <div class="form-group">
      <label>Point: </label>
      <select v-on:change="updateGraph()" v-model="point" class="form-control">
        <option value="accumulated_real">Accumulated Real</option>
        <option value="real_power">Total Real Power</option>
        <option value="reactive_power">Total Reactive Power</option>
        <option value="apparent_power">Total Apparent Power</option>
        <option value="real_a">Real Power, Phase A</option>
        <option value="real_b">Real Power, Phase B</option>
        <option value="real_c">Real Power, Phase C</option>
        <option value="reactive_a">Reactive Power, Phase A</option>
        <option value="reactive_b">Reactive Power, Phase B</option>
        <option value="reactive_c">Reactive Power, Phase C</option>
        <option value="apparent_a">Apparent Power, Phase A</option>
        <option value="apparent_b">Apparent Power, Phase B</option>
        <option value="apparent_c">Apparent Power, Phase C</option>
        <option value="pf_a">Power Factor, Phase A</option>
        <option value="pf_b">Power Factor, Phase B</option>
        <option value="pf_c">Power Factor, Phase C</option>
        <option value="vphase_ab">Voltage Phase, Phase A-B</option>
        <option value="vphase_bc">Voltage Phase, Phase B-C</option>
        <option value="vphase_ac">Voltage Phase, Phase A-C</option>
        <option value="vphase_an">Voltage Phase, Phase A-N</option>
        <option value="vphase_bn">Voltage Phase, Phase B-N</option>
        <option value="vphase_cn">Voltage Phase, Phase C-N</option>
        <option value="cphase_a">Current Phase, Phase A</option>
        <option value="cphase_b">Current Phase, Phase B</option>
        <option value="cphase_c">Current Phase, Phase C</option>
      </select>
    <label>Group: </label>
    <select ref="groups" v-on:input="updateGraph()" class="form-control" v-model="groupid">
    </select>
    <label>From Date: </label>
    <form class="form-inline">
      <dropdown class="form-group">
        <div class="input-group">
          <input class="form-control" type="text" v-model="dateFrom" v-on:change="updateGraph()">
          <div class="input-group-btn">
            <btn class="dropdown-toggle"><i class="glyphicon glyphicon-calendar"></i></btn>
          </div>
        </div>
        <template slot="dropdown">
          <li>
            <date-picker v-model="dateFrom" v-on:change="updateGraph()"/>
          </li>
        </template>
      </dropdown>
      <dropdown class="form-group">
        <div class="input-group">
          <input class="form-control" type="text" v-model="this.timeFrom.toTimeString()" readonly="readonly">
          <div class="input-group-btn">
            <btn class="dropdown-toggle"><i class="glyphicon glyphicon-time"></i></btn>
          </div>
        </div>
        <template slot="dropdown">
          <li style="padding: 10px">
            <time-picker v-model="timeFrom"/>
          </li>
        </template>
      </dropdown>
    </form>
    <label>To Date: </label>
    <form class="form-inline" v-on:submit="updateGraph()">
      <dropdown class="form-group" v-on:change="updateGraph()">
        <div class="input-group">
          <input class="form-control" type="text" v-model="dateTo" v-on:change="updateGraph()">
          <div class="input-group-btn">
            <btn class="dropdown-toggle"><i class="glyphicon glyphicon-calendar"></i></btn>
          </div>
        </div>
        <template slot="dropdown">
          <li>
            <date-picker v-model="dateTo" v-on:change="updateGraph()"/>
          </li>
        </template>
      </dropdown>
      <dropdown class="form-group">
        <div class="input-group">
          <input class="form-control" type="text" v-model="this.timeTo.toTimeString()" readonly="readonly">
          <div class="input-group-btn">
            <btn class="dropdown-toggle"><i class="glyphicon glyphicon-time"></i></btn>
          </div>
        </div>
        <template slot="dropdown">
          <li style="padding: 10px">
            <time-picker v-model="timeTo"/>
          </li>
        </template>
      </dropdown>
    </form>
      <div class="form-group">
        <label>Graph Type: </label>
        <select class="form-control" v-model="graphType" >
          <option value="difference">Interval Difference Line Chart</option>
        </select>
        <label>Interval: </label>
        <br />
        <select class="form-control sharedLine" v-model="unit" >
          <option value="minute">Minutes</option>
          <option value="hour">Hours</option>
          <option value="day">Days</option>
          <option value="month">Months</option>
        </select>
        <input type="number" step="15" class="form-control sharedLine" v-model="interval"/>
        
      </div>
    </div>
  </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'featureController',
  components: {
  },
  props: [],
  data() {
    return {
      point: "accumulated_real", 
      groupid: 8,
      dateFrom: "2018-06-01",//new Date(2018,5,1, 0, 0, 0, 0),
      dateTo: "2018-06-30", //new Date(2018,5,30, 0, 0, 0, 0)
      timeTo: new Date(0,0,0,0,0,0),
      timeFrom: new Date(0,0,0,0,0),
      interval: 15,
      graphType: "difference",
      unit: "minute",
      isMaximized: false

    }
  },
  methods: {
    updateGraph: function () {
      //this.$parent.loaded = false;
      this.$parent.getData(this.point,this.groupid,this.dateFrom+this.parseDateTime(this.timeFrom), this.dateTo+this.parseDateTime(this.timeTo),this.interval.toString(),this.unit);
    },
    parseDateTime: function(dateTime) {
      var hours = dateTime.getHours();
      if (hours < 10)
        hours = "0"+hours,toString();
      var minutes =dateTime.getMinutes()
      if (minutes < 10)
        minutes = "0"+minutes.toString();
      return "T"+hours+":"+minutes+":000"
    }
  },
  watch: {
    dateFrom: function(value) {
      this.updateGraph();
    },
    dateTo: function(value) {
      this.updateGraph();
    },
    timeTo: function(value) {
      this.updateGraph();
    },
    graphType: function(value) {
      this.updateGraph();
    },
    interval: function(value) {
      this.updateGraph();
    },
    unit: function(value) {
      this.updateGraph();
    }
  },
  mounted () {
    axios.get('http://localhost:3000/api/getAllBuildings').then (res => {
       res.data.forEach(obj => {
          this.$refs.groups.innerHTML += "<option value='"+obj.id+"'>"+obj.name+"</option>";
       });
     }).catch (e => {
      this.errors.push(e);
     });
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.controlSection {
  display: inline-block;
  width: 340px;
  height: 100%;
  position: absolute;
  right: 0px;
  top: 0px;
  padding: 10px;
  color: white;
  z-index: 5;
  background-color: rgba(0,0,0,0.8);
}
.sharedLine {
  width: 40%;
  display: inline-block;
}
.expand {
  height: 100%;
  width: 40px;
  display: inline-block;
  font-size: 2em;
  padding-top: 55%;
}
.controls {
  position: absolute;
  display: inline-block;
}
/*.input-group {
  width: 50%;
}
.input-group input {
  font-size: 10px;
  width: 100%;
}*/
</style>
