<template>
<div class="controlSection">
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
  </form>
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
      dateFrom: "2018-06-01",
      dateTo: "2018-06-30"
    }
  },
  methods: {
    updateGraph: function () {
      //this.$parent.loaded = false;
      console.log(this.groupid, this.point, this.dateFrom, this.dateTo);
      this.$parent.getData(this.point,this.groupid,this.dateFrom, this.dateTo);
    }
  },
  watch: {
    dateFrom: function(value) {
      this.updateGraph();
    },
    dateTo: function(value) {
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
  width: 300px;
  height: 100%;
  position: absolute;
  right: 0px;
  top: 0px;
  padding: 10px;
  color: white;
  z-index: 5;
  background-color: rgba(0,0,0,0.8);
}
</style>
