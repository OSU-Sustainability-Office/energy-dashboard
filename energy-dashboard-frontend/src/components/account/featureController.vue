<template>
  <div class="controlArea container" ref="movingArea">
    <div class="expandingSection" @click="isMaximized = !isMaximized">
      <i class="fas" v-bind:class="{ 'fa-chevron-circle-left' : !isMaximized, 'fa-chevron-circle-right' : isMaximized }"></i>
    </div>

    <div class="container-fluid controlSection" ref="controlArea">
      <div class="row indexChooser" ref="indexChooser">
        <b-button class="indexButton"  v-for="(point, index) in this.block(index).charts" :variant='buttonVariant(index)' @click="currentIndex = index" :key='index'>{{ index + 1 }}</b-button>
        <b-button class="indexButton" @click="addGroup()">+</b-button>
      </div>

      <div class="row nameChooser form-group">
        <label>Name:</label>
        <el-input type="text" v-model="name"></el-input>
      </div>

      <div class="row pointChooser form-group">
        <label>Point: </label>
        <el-select v-model="point">
          <!-- Electrical Meter Options -->
          <el-option value="accumulated_real" v-if="currentType === 'e'" label='Accumulated Real'></el-option>
          <el-option value="real_power" v-if="currentType === 'e'" label='Total Real Power'></el-option>
          <el-option value="reactive_power" v-if="currentType === 'e'" label='Total Reactive Power'></el-option>
          <el-option value="apparent_power" v-if="currentType === 'e'" label='Total Apparent Power'></el-option>
          <el-option value="real_a" v-if="currentType === 'e'" label='Real Power, Phase A'></el-option>
          <el-option value="real_b" v-if="currentType === 'e'" label='Real Power, Phase B'></el-option>
          <el-option value="real_c" v-if="currentType === 'e'" label='Real Power, Phase C'></el-option>
          <el-option value="reactive_a" v-if="currentType === 'e'" label='Reactive Power, Phase A'></el-option>
          <el-option value="reactive_b" v-if="currentType === 'e'" label='Reactive Power, Phase B'></el-option>
          <el-option value="reactive_c" v-if="currentType === 'e'" label='Reactive Power, Phase C'></el-option>
          <el-option value="apparent_a" v-if="currentType === 'e'" label='Apparent Power, Phase A'></el-option>
          <el-option value="apparent_b" v-if="currentType === 'e'" label='Apparent Power, Phase B'></el-option>
          <el-option value="apparent_c" v-if="currentType === 'e'" label='Apparent Power, Phase C'></el-option>
          <el-option value="pf_a" v-if="currentType === 'e'" label='Power Factor, Phase A'></el-option>
          <el-option value="pf_b" v-if="currentType === 'e'" label='Power Factor, Phase B'></el-option>
          <el-option value="pf_c" v-if="currentType === 'e'" label='Power Factor, Phase C'></el-option>
          <el-option value="vphase_ab" v-if="currentType === 'e'" label='Voltage Phase, Phase A-B'></el-option>
          <el-option value="vphase_bc" v-if="currentType === 'e'" label='Voltage Phase, Phase B-C'></el-option>
          <el-option value="vphase_ac" v-if="currentType === 'e'" label='Voltage Phase, Phase A-C'></el-option>
          <el-option value="vphase_an" v-if="currentType === 'e'" label='Voltage Phase, Phase A-N'></el-option>
          <el-option value="vphase_bn" v-if="currentType === 'e'" label='Voltage Phase, Phase B-N'></el-option>
          <el-option value="vphase_cn" v-if="currentType === 'e'" label='Voltage Phase, Phase C-N'></el-option>
          <el-option value="cphase_a" v-if="currentType === 'e'" label='Current Phase, Phase A'></el-option>
          <el-option value="cphase_b" v-if="currentType === 'e'" label='Current Phase, Phase B'></el-option>
          <el-option value="cphase_c" v-if="currentType === 'e'" label='Current Phase, Phase C'></el-option>

          <!-- Gas Meter Options -->
          <el-option value="cubic_feet" v-if="currentType === 'g'" label='Accumulated Usage'></el-option>

          <!-- Steam Meter Options -->
          <el-option value="total" v-if="currentType === 's'" label='Accumulated Usage'></el-option>

        </el-select>
      </div>

      <div class="row groupChooser form-group">
        <label>Building: </label>
        <el-select ref="groups" v-model="group" filterable placeholder="Building">
          <el-option v-for='(item, index) in buildings' :key='index' :label='item.name' :value='item.id'></el-option>
        </el-select>
        <!-- <label>Meter: </label>
        <select ref="submeters" class="form-control" v-model="meter">
          <option value=0>All</option>
        </select> -->
      </div>
      <div class="row fromDateChooser form-group">
        <label>From Date: </label>
        <el-date-picker v-model='start' type='datetime'>
        </el-date-picker>
      </div>

       <div class="row toDateChooser form-group">
        <label>To Date: </label>
        <el-date-picker v-model='end' type='datetime'>
        </el-date-picker>
      </div>
      <!--<div class="row graphTypeChooser form-group">
        <label>Graph Type: </label>
        <select class="form-control" v-model="graphType" >
          <option value=1>Line Chart</option>
          <option value=2>Bar Chart</option>
          <option value=3>Doughnut Chart</option>
          <option value=4>Pie Chart</option>
        </select>
      </div>-->

      <div class="row intervalUnitChooser form-group">
        <label style='width: 100%'>Interval: </label>
        <el-select class="sharedLine" v-model="unit" >
          <el-option value="minute" label='Minutes'></el-option>
          <el-option value="hour" label='Hours'></el-option>
          <el-option value="day" label='Days'></el-option>
          <el-option value="month" label='Months'></el-option>
        </el-select>
        <el-input-number :step="step" class="sharedLine" v-model="interval" controls-position='right'></el-input-number>
      </div>
      <div class="row form-group justify-content-center deletebutton" v-if='this.block(index).charts.length > 1'>
        <b-btn class='col-10' @click='deleteChart()'>Delete</b-btn>
      </div>

    </div>
  </div>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'featureController',
  components: {
  },
  props: ['index'],
  data () {
    return {
      isMaximized: false,
      currentType: 'e',
      colors: [],
      // This is the charts index, the blocks index is index (really confusing I know, we should change the variable names)
      currentIndex: 0,
      keyPressTimeOut: null,
      mounted: false,
      oldStart: null,
      oldEnd: null,
      test: ''

    }
  },
  asyncComputed: {
    buildings: {
      get: function () {
        return this.$store.dispatch('buildings')
      }
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block'
    ]),
    step: {
      get: function () {
        if (this.unit === 'minute') {
          return 15
        } else {
          return 1
        }
      }
    },
    name: {
      get: function () {
        let n = this.block(this.index).charts[this.currentIndex].name
        return n
      },
      set: function (v) {
        this.$store.dispatch('block', { index: this.index, charts: [{ name: v, index: this.currentIndex }] }).then(() => {
          this.$parent.$refs.chartController.parse()
        })
      }
    },
    start: {
      get: function () {
        let s = this.block(this.index).date_start
        return s
      },
      set: function (v) {
        this.$store.dispatch('block', { index: this.index, date_start: v.toISOString() }).then(() => {
          this.$parent.$refs.chartController.parse()
        })
      }
    },
    end: {
      get: function () {
        return this.block(this.index).date_end
      },
      set: function (v) {
        this.$store.dispatch('block', { index: this.index, date_end: v.toISOString() }).then(() => {
          this.$parent.$refs.chartController.parse()
        })
      }
    },
    point: {
      get: function () {
        return this.block(this.index).charts[this.currentIndex].point
      },
      set: function (v) {
        this.$store.dispatch('block', { index: this.index, charts: [{ point: v, index: this.currentIndex }] }).then(() => {
          this.$parent.$refs.chartController.parse()
        })
      }
    },
    group: {
      get: function () {
        return this.block(this.index).charts[this.currentIndex].group_id
      },
      set: function (v) {
        this.$store.dispatch('building', { blockIndex: this.index, chartIndex: this.currentIndex, group_id: v }).then(() => {
          this.$parent.$refs.chartController.parse()
        })
      }
    },
    unit: {
      get: function () {
        return this.block(this.index).interval_unit
      },
      set: function (v) {
        this.$store.dispatch('block', { index: this.index, interval_unit: v }).then(() => {
          this.$parent.$refs.chartController.parse()
        })
      }
    },
    interval: {
      get: function () {
        return this.block(this.index).date_interval
      },
      set: function (v) {
        this.$store.dispatch('block', { index: this.index, date_interval: v }).then(() => {
          this.$parent.$refs.chartController.parse()
        })
      }
    }
  },
  methods: {
    addGroup: function () {
      this.$store.dispatch('addChart', { index: this.index }).then(() => {
        this.$parent.$refs.chartController.parse()
      })
    },
    buttonVariant: function (i) {
      if (i === this.currentIndex) {
        return 'primary'
      } else {
        return 'secondary'
      }
    },
    deleteChart: function () {
      this.$store.commit('removeChart', { blockIndex: this.index, chartIndex: this.currentIndex })
      this.currentIndex = 0
      this.$parent.$refs.chartController.parse()
    }
  },
  watch: {
    isMaximized: function (value) {
      if (value) {
        this.$refs.movingArea.style.right = '0px'
      } else {
        this.$refs.movingArea.style.right = '-260px'
      }
    }
  },
  created () {
  },
  mounted () {
    // this.updateSubmeters()
    // axios.get(process.env.ROOT_API + 'api/getAllBuildings').then(res => {
    //   res.data.forEach(obj => {
    //     this.$refs.groups.innerHTML += '<option value="' + obj.id + '">' + obj.name + '</option>'
    //   })
    // }).catch(e => {
    //   this.errors.push(e)
    // })
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
  cursor: pointer;
}
.expandingSection:hover .fas {
  color: rgb(215,63,9);
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
.sharedLine {
  width: 48%;
  display: inline-block;
  margin: 0.1em;
}

.controlArea {
  position: absolute;
  width: 300px;
  right: -260px;
  height: 100%;
  background-color: rgba(0,0,0,0.7);
  transition: right 1s;
}
.deletebutton {
  padding-bottom: 1em;
}
</style>
el-
