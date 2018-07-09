<template>
  <div class="controlArea container" ref="movingArea">
    <div class="expandingSection" v-on:click="isMaximized = !isMaximized">
      <i class="fas" v-bind:class="{ 'fa-chevron-circle-left' : !isMaximized, 'fa-chevron-circle-right' : isMaximized }"></i>
    </div>

    <div class="container-fluid controlSection" ref="controlArea">
      <div class="row indexChooser" ref="indexChooser">
        <btn class="indexButton" v-for="(point, index) in points" @click="currentIndex = index">{{ index + 1 }}</btn>
        <btn class="indexButton" @click="addGroup()">+</btn>
      </div>

      <div class="row nameChooser form-group">
        <label>Name:</label>
        <input class="form-control" type="text" v-model="names[currentIndex]">
      </div>

      <div class="row pointChooser form-group">
        <label>Point: </label>
        <select v-model="points[currentIndex]" class="form-control">
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
      </div>

      <div class="row groupChooser form-group">
        <label>Group: </label>
        <select ref="groups" class="form-control" v-model="groupids[currentIndex]">
        </select>
      </div>

      <div class="row fromDateChooser form-group">
        <label>From Date: </label>
        <form class="form-inline">
          <dropdown class="form-group">
            <div class="input-group">
              <input class="form-control" type="text" v-model="dateFrom">
              <div class="input-group-btn">
                <btn class="dropdown-toggle"><i class="glyphicon glyphicon-calendar"></i></btn>
              </div>
            </div>
            <template slot="dropdown">
              <li>
                <date-picker v-model="dateFrom"/>
              </li>
            </template>
          </dropdown>
          <dropdown class="form-group">
            <div class="input-group">
              <input class="form-control" type="text" v-model="timeFrom.toTimeString()" readonly="readonly">
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
      </div>

      <div class="row toDateChooser form-group">
        <label>To Date: </label>
        <form class="form-inline">
          <dropdown class="form-group">
            <div class="input-group">
              <input class="form-control" type="text" v-model="dateTo">
              <div class="input-group-btn">
                <btn class="dropdown-toggle"><i class="glyphicon glyphicon-calendar"></i></btn>
              </div>
            </div>
            <template slot="dropdown">
              <li>
                <date-picker v-model="dateTo"/>
              </li>
            </template>
          </dropdown>
          <dropdown class="form-group">
            <div class="input-group">
              <input class="form-control" type="text" v-model="timeTo.toTimeString()" readonly="readonly">
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
      </div>

      <div class="row graphTypeChooser form-group">
        <label>Graph Type: </label>
        <select class="form-control" v-model="graphType" >
          <option value=1>Line Chart</option>
          <option value=2>Bar Chart</option>
          <option value=3>Doughnut Chart</option>
          <option value=4>Pie Chart</option>
        </select>
      </div>

      <div class="row intervalUnitChooser form-group">
        <label>Interval: </label>
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
      // point: "accumulated_real",
      // groupid: 8,
      dateFrom: "2018-06-01",//new Date(2018,5,1, 0, 0, 0, 0),
      dateTo: "2018-06-30", //new Date(2018,5,30, 0, 0, 0, 0)
      timeTo: new Date(0,0,0,0,0,0),
      timeFrom: new Date(0,0,0,0,0),
      interval: 15,
      graphType: 1,
      unit: "",
      isMaximized: false,
      // name: ""
      points: [],
      groupids: [],
      //dateFroms: [],
      //dateTos: [],
      //timeTos: [],
      //timeFroms: [],
      //intervals: [],
      //graphTypes: [],
      //units: [],
      names: [],
      colors: [],
      currentIndex: 0

    }
  },
  methods: {
    addGroup: function() {
      this.points.push('accumulated_real');
      this.groupids.push(8);
      this.names.push('New Graph')
      //this.currentIndex = this.points.length -1;
    },
    updateGraph: function (partial) {
      //this.$parent.loaded = false;
      //console.log(this.$parent);
      //console.log(this.points);
      //console.log(this.groupids);
      if (this.points.length > this.currentIndex && this.groupids.length > this.currentIndex && !partial) {
        this.$parent.$refs.chartController.getData(this.currentIndex,this.points[this.currentIndex],this.groupids[this.currentIndex],this.dateFrom+this.parseDateTime(this.timeFrom), this.dateTo+this.parseDateTime(this.timeTo),this.interval.toString(),this.unit).then(() => {
          this.$parent.$refs.chartController.updateChart();
        });
      }
      else {
        var promises = [];
        for (var i = 0; i < this.points.length; i++) {

          promises.push(this.$parent.$refs.chartController.getData(i,this.points[i],this.groupids[i],this.dateFrom+this.parseDateTime(this.timeFrom), this.dateTo+this.parseDateTime(this.timeTo),this.interval.toString(),this.unit));
          //console.log("update");
        }
        Promise.all(promises).then(values => {
          this.$parent.$refs.chartController.updateChart();
        });
      }

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
      if(!value)
        return;
      this.$parent.$refs.chartController.start = value.toString() + this.parseDateTime(this.timeFrom);
      this.updateGraph(true);
    },
    dateTo: function(value) {
      if (!value)
        return;
      this.$parent.$refs.chartController.end = value.toString() + this.parseDateTime(this.timeTo);
      this.updateGraph(true);
    },
    groupids: function(value) {
      if (!value)
        return;
      this.$parent.$refs.chartController.groups = value;
      this.updateGraph(false);
    },
    timeTo: function(value) {
      if (!value)
        return;
      this.$parent.$refs.chartController.end = this.dateTo.toString() + this.parseDateTime(value);
      this.updateGraph(true);
    },
    timeFrom: function(value) {
      if (!value)
        return;
      this.$parent.$refs.chartController.start = this.dateFrom.toString() + this.parseDateTime(value);
      this.updateGraph(true);
    },
    graphType: function(value) {
      if (!value)
        return;
      this.$parent.$refs.chartController.graphType = value;
      //this.updateGraph(true);
    },
    interval: function(value) {
      if (!value)
        return;
      this.$parent.$refs.chartController.interval = value;
      this.updateGraph(true);
    },
    unit: function(value) {
      if (!value)
        return;
      this.$parent.$refs.chartController.unit = value;
      this.updateGraph(true);
    },
    points: function(value) {
      if (!value)
        return;
      this.updateGraph(false);
      this.$parent.$refs.chartController.points = value;
      Array.from(this.$refs.indexChooser.children).forEach(e => {e.style.borderColor = "#FFFFFF"});
      this.$refs.indexChooser.children[this.currentIndex].style.borderColor = 'rgb(215,63,9)';
    },
    names: function(value) {
      if (!value)
        return;
      this.$parent.$refs.chartController.names = value;
      this.$parent.$refs.chartController.updateChart();
    },
    currentIndex: function(value) {
      // /console.log(this.$refs.indexChooser.children);
      Array.from(this.$refs.indexChooser.children).forEach(e => {e.style.borderColor = "#FFFFFF"});
      this.$refs.indexChooser.children[this.currentIndex].style.borderColor = 'rgb(215,63,9)';
    },
    isMaximized: function(value) {
      if (value) {
        this.$refs.movingArea.style.right = "0px";
      }
      else {
        this.$refs.movingArea.style.right = "-260px";
      }
    }
  },
  created() {

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
.expandingSection {
  height:100%;
  position: absolute;
  left:0px;
  width: 40px;
  display: inline-block;
}
.fas {
  color: #fff;
  font-size: 2em;
  display: block;
  text-align: center;
  position: relative;
  top: calc(50% - 1em);
}


.controlSection {
  position: absolute;
  right: 0px;
  width: 260px;
  display: inline;
  height:100%;
  padding: 1em;
  padding-left: 0.5em;
  overflow-y: scroll;
}
.indexChooser{
  width: 100%;
  height: 50px;
  margin: 0px;
  overflow-x: scroll;
  flex-wrap: nowrap;
}
.indexButton {
  position: static;
  color: #fff;
  background-color: #000;
  margin: 0.2em;
  width: 50px;
  height: 40px;
  display: inline-block;
}

.form-group.row {
  width: 100%;
  padding-left: 0.8em;
  color: #fff;
}
.dropdown-toggle {
  position: relative;
  top:-4px;
  left: -25px;
  height: 30px;
}

.form-group.row input {
  height: 30px;
  position: relative;
  left: 0px;
  margin-bottom: 0.5em;
}

.form-group.row select {
  height: 30px;
}

.intervalUnitChooser input {
  margin-top: 0.5em;
}

.controlArea {
  position: absolute;
  width: 300px;
  right: -260px;
  height: 100%;
  background-color: rgba(0,0,0,0.7);
  transition: right 1s;
}
</style>
