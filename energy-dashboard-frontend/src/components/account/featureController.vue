<template>
  <div class="controlArea container" ref="movingArea">
    <div class="expandingSection" @click="isMaximized = !isMaximized">
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
          <!-- Electrical Meter Options -->
          <option value="accumulated_real" v-if="currentType == 'e'">Accumulated Real</option>
          <option value="real_power" v-if="currentType == 'e'">Total Real Power</option>
          <option value="reactive_power" v-if="currentType == 'e'">Total Reactive Power</option>
          <option value="apparent_power" v-if="currentType == 'e'">Total Apparent Power</option>
          <option value="real_a" v-if="currentType == 'e'">Real Power, Phase A</option>
          <option value="real_b" v-if="currentType == 'e'">Real Power, Phase B</option>
          <option value="real_c" v-if="currentType == 'e'">Real Power, Phase C</option>
          <option value="reactive_a" v-if="currentType == 'e'">Reactive Power, Phase A</option>
          <option value="reactive_b" v-if="currentType == 'e'">Reactive Power, Phase B</option>
          <option value="reactive_c" v-if="currentType == 'e'">Reactive Power, Phase C</option>
          <option value="apparent_a" v-if="currentType == 'e'">Apparent Power, Phase A</option>
          <option value="apparent_b" v-if="currentType == 'e'">Apparent Power, Phase B</option>
          <option value="apparent_c" v-if="currentType == 'e'">Apparent Power, Phase C</option>
          <option value="pf_a" v-if="currentType == 'e'">Power Factor, Phase A</option>
          <option value="pf_b" v-if="currentType == 'e'">Power Factor, Phase B</option>
          <option value="pf_c" v-if="currentType == 'e'">Power Factor, Phase C</option>
          <option value="vphase_ab" v-if="currentType == 'e'">Voltage Phase, Phase A-B</option>
          <option value="vphase_bc" v-if="currentType == 'e'">Voltage Phase, Phase B-C</option>
          <option value="vphase_ac" v-if="currentType == 'e'">Voltage Phase, Phase A-C</option>
          <option value="vphase_an" v-if="currentType == 'e'">Voltage Phase, Phase A-N</option>
          <option value="vphase_bn" v-if="currentType == 'e'">Voltage Phase, Phase B-N</option>
          <option value="vphase_cn" v-if="currentType == 'e'">Voltage Phase, Phase C-N</option>
          <option value="cphase_a" v-if="currentType == 'e'">Current Phase, Phase A</option>
          <option value="cphase_b" v-if="currentType == 'e'">Current Phase, Phase B</option>
          <option value="cphase_c" v-if="currentType == 'e'">Current Phase, Phase C</option>

          <!-- Gas Meter Options -->
          <option value="cubic_feet" v-if="currentType == 'g'">Accumulated Usage</option>

          <!-- Steam Meter Options -->
          <option value="total" v-if="currentType == 's'">Accumulated Usage</option>

        </select>
      </div>

      <div class="row groupChooser form-group">
        <label>Group: </label>
        <select ref="groups" class="form-control" v-model="groupids[currentIndex]">
        </select>
        <label>Sub-Meter: </label>
        <select ref="submeters" class="form-control" v-model="submeters[currentIndex]">
          <option value=0>All</option>
        </select>
      </div>
      <div class="row fromDateChooser form-group">
        <label>From Date: </label>
        <form class="form-inline">
          <dropdown class="form-group" append-to-body>
            <div class="input-group">
              <input class="form-control" type="text" v-model="start" >
              <div class="input-group-btn">
                <btn class="dropdown-toggle"><i class="glyphicon glyphicon-calendar"></i></btn>
              </div>
            </div>
            <template slot="dropdown">
              <li>
                <date-picker v-model="start"/>
              </li>
            </template>
          </dropdown>
          <dropdown class="form-group" append-to-body>
            <div class="input-group">
              <input class="form-control" type="text" v-model="start" readonly="readonly">
              <div class="input-group-btn">
                <btn class="dropdown-toggle"><i class="glyphicon glyphicon-time"></i></btn>
              </div>
            </div>
            <template slot="dropdown">
              <li style="padding: 10px">
                <time-picker v-model="start"/>
              </li>
            </template>
          </dropdown>
        </form>
      </div>

      <div class="row toDateChooser form-group">
        <label>To Date: </label>
        <form class="form-inline">
          <dropdown class="form-group" append-to-body>
            <div class="input-group">
              <input class="form-control" type="text" v-model="end">
              <div class="input-group-btn">
                <btn class="dropdown-toggle"><i class="glyphicon glyphicon-calendar"></i></btn>
              </div>
            </div>
            <template slot="dropdown">
              <li>
                <date-picker v-model="end" format="yyyy-MM-dd"/>
              </li>
            </template>
          </dropdown>
          <dropdown class="form-group" append-to-body>
            <div class="input-group">
              <input class="form-control" type="text" v-model="end" readonly="readonly">
              <div class="input-group-btn">
                <btn class="dropdown-toggle"><i class="glyphicon glyphicon-time"></i></btn>
              </div>
            </div>
            <template slot="dropdown">
              <li style="padding: 10px">
                <time-picker v-model="end"/>
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
      <!-- <div class="row deleteButton">
        <btn @click='deleteGroup()'>Delete</btn>
      </div> -->

    </div>
  </div>
</template>

<script>
import axios from 'axios';

export default {
  name: 'featureController',
  components: {
  },
  props: ["start", "end", "interval", "graphType", "unit", "points", "groupids", "submeters", "names"],
  data() {
    return {
      isMaximized: false,
      currentType: 'e',
      colors: [],
      currentIndex: 0,
      keyPressTimeOut: null,
      mounted: false,
      oldStart: null,
      oldEnd: null

    }
  },
  methods: {
    addGroup: function() {
      this.points.push('accumulated_real');
      this.groupids.push(8);
      this.names.push('New Graph');
      this.submeters.push(0);
    },
    deleteGroup: function() {
      this.points.splice(this.currentIndex,1);
      this.groupids.splice(this.currentIndex,1);
      this.names.splice(this.currentIndex,1);
      this.submeters.splice(this.currentIndex,1);

      this.$parent.setPoints(this.points);
      this.$parent.setGroups(this.groupids);
      this.$parent.setNames(this.names);

      this.$parent.setMeters(this.meters);
      this.mounted = true;
    },
    updateGraph: function (partial) {
      if (this.points.length > this.currentIndex && this.groupids.length > this.currentIndex && !partial) {
        this.$parent.$refs.chartController.getData(this.currentIndex,this.points[this.currentIndex],this.groupids[this.currentIndex],this.start.toISOString(), this.end.toISOString(),this.interval,this.unit,this.submeters[this.currentIndex]).then(() => {
          this.$parent.$refs.chartController.updateChart();
        }).catch(e=>{});
      }
      else {
        var promises = [];
        for (var i = 0; i < this.points.length; i++) {
          promises.push(this.$parent.$refs.chartController.getData(i,this.points[i],this.groupids[i],this.start.toISOString(), this.end.toISOString(),this.interval,this.unit,this.submeters[i]));
        }
        Promise.all(promises).then(values => {
          this.$parent.$refs.chartController.updateChart();
        }).catch(e=>{});
      }
    },
    parseDateTime: function(dateTime) {
      if (!dateTime)
        return;
      var hours = dateTime.getHours();
      if (hours < 10)
        hours = "0"+hours,toString();
      var minutes =dateTime.getMinutes()
      if (minutes < 10)
        minutes = "0"+minutes.toString();
      return "T"+hours+":"+minutes+":000"
    },
    updateSubmeters: function() {
      axios.get(process.env.ROOT_API+'api/getMetersForGroup?id='+this.groupids[this.currentIndex]).then(rows => {

        this.$refs.submeters.innerHTML = "<option value=0>All</option>";
        for (var r in rows.data) {
          this.$refs.submeters.innerHTML += "<option value="+rows.data[r].id+">"+rows.data[r].name+"</option>";
        }
      });
    },
    updatedSubmetersValue: function(value) {
      if (!value)
        return;
      if (parseInt(value[this.currentIndex]) === 0) {
        this.currentType = "e";
        //
        //this.$parent.$refs.chartController.points[this.currentIndex] = "accumulated_real";
        //this.$parent.$refs.chartController.submeters = value;
        if (!this.mounted) {
          this.$parent.setMeters(value);
        }
        else {
          this.points[this.currentIndex] = "accumulated_real";
          this.$parent.setPoints(this.points);
          this.$parent.setMeters(value);
          this.updateGraph(false);
        }
      }
      else {
        axios.get(process.env.ROOT_API+'api/getMeterType?id='+parseInt(value[this.currentIndex])).then(rows => {

          this.currentType = rows.data[0].type;
          this.$parent.setMeters(value);

          if(this.mounted) {
             if (rows.data[0].type == "s") {
              this.points[this.currentIndex] = "total";
            }
            else if (rows.data[0].type == "g") {
              this.points[this.currentIndex] = "cubic_feet";
            }
            else if (rows.data[0].type == "e") {
              this.points[this.currentIndex] = "accumulated_real";
            }
            this.$parent.setPoints(this.points);

            this.updateGraph(false);

          }
        });
      }
    }
  },
  watch: {
    start: function(value) {
      if (!value)
        return;
          //the stupid datepicker changes it back to a string
      if (typeof value === 'string') {
        this.start = new Date(value);
        return;
      }
      //Because it is a date object it calls this method even though it doesnt change
      if (this.oldStart && this.oldStart.toISOString() === value.toISOString()) {
        return;
      }
      this.oldStart = value;
      this.$parent.setStart(value.toISOString());


      if (this.mounted)
        this.updateGraph(true);
    },
    end: function(value) {
      if (!value)
        return;
        //the stupid datepicker changes it back to a string
      if (typeof value === 'string') {
        this.end = new Date(value);
        return;
      }
      //Because it is a date object it calls this method even though it doesnt change
      if (this.oldEnd && this.oldEnd.toISOString() === value.toISOString()) {
        return;
      }
      this.oldEnd = value;

      this.$parent.setEnd(value.toISOString());
      if (this.mounted)
        this.updateGraph(true);
    },
    groupids: function(value) {
      if (!value)
        return;
      this.$parent.setGroups(value);
      this.updateSubmeters();
      if (this.mounted) {
        this.submeters[this.currentIndex] = 0; //This updates the graph for us
        this.updatedSubmetersValue(this.submeters);

      }


    },
    graphType: function(value) {
      if (!value)
        return;
      this.$parent.setType(value);
    },
    interval: function(value) {
      if (!value)
        return;
      this.$parent.setInt(value);
      if (this.mounted)
        this.updateGraph(true);
    },
    unit: function(value) {
      if (!value)
        return;
      this.$parent.setUnit(value);
      if (this.mounted)
        this.updateGraph(true);
    },
    submeters: function(value) {
      if (!value)
        return;
      this.$parent.$refs.chartController.updateFlag = true;
      this.updatedSubmetersValue(value);

    },
    points: function(value) {
      if (!value)
        return;
      this.$parent.setPoints(value);
      if (this.mounted)
        this.updateGraph(false);
      this.$nextTick(() => {
        Array.from(this.$refs.indexChooser.children).forEach(e => {e.style.borderColor = "#FFFFFF"});
        this.$refs.indexChooser.children[this.currentIndex].style.borderColor = 'rgb(215,63,9)';
      });
    },
    names: function(value) {
      if (!value)
        return;
      this.$parent.setNames(value);
      if (this.mounted) {
        clearTimeout(this.keyPressTimeOut);
        this.keyPressTimeOut = setTimeout(() => {
          this.updateGraph(false);
        }, 800);
      }

    },
    currentIndex: function(value) {
      Array.from(this.$refs.indexChooser.children).forEach(e => {e.style.borderColor = "#FFFFFF"});
      this.$refs.indexChooser.children[this.currentIndex].style.borderColor = 'rgb(215,63,9)';

      this.updateSubmeters();
      if (parseInt(this.submeters[this.currentIndex]) === 0) {
        this.currentType = 'e';
      }
      else {
        axios.get(process.env.ROOT_API+'api/getMeterType?id='+parseInt(his.submeters[value])).then(r => {
          this.currentType = r.data[0].type;
        });
      }
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
    this.updateSubmeters();
    axios.get(process.env.ROOT_API+'api/getAllBuildings').then (res => {
       res.data.forEach(obj => {
          this.$refs.groups.innerHTML += "<option value='"+obj.id+"'>"+obj.name+"</option>";
       });
     }).catch (e => {
      this.errors.push(e);
     });

     this.$nextTick(() => {
     });

  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.btn-primary {
  background-color: rgb(215,63,9) !important;
}
.btn-info {
  background-color: rgb(215,63,9) !important;
  border: none;
}
 .btn-block.btn-info {
  background-color: rgb(26,26,26) !important;
}
.glyphicon {
  color: rgb(215,63,9) !important;
}
</style>
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
  flex-shrink: 0;
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
