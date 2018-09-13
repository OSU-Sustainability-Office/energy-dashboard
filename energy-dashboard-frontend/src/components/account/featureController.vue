<template>
    <div class="container-fluid controlSection" ref="controlArea">
      <div class="row indexChooser" ref="indexChooser" v-if='!story.public'>
        <b-button class="indexButton"  v-for="(point, index) in this.point" :variant='buttonVariant(index)' @click="currentIndex = index" :key='index'>{{ index + 1 }}</b-button>
        <b-button class="indexButton" @click="addGroup()">+</b-button>
      </div>

      <div class="row nameChooser form-group" v-if='!story.public'>
        <label class='col-4'>Name:</label>
        <el-input type="text" v-model="name[currentIndex]" class='col'></el-input>
      </div>

      <div class="row pointChooser form-group">
        <label class='col-4'>Point: </label>
        <el-select v-model="point[currentIndex]" class='col'>
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

      <div class="row groupChooser form-group" v-if='!story.public'>
        <label class='col-4'>Building: </label>
        <el-select ref="groups" v-model="group[currentIndex]" filterable placeholder="Building" class='col'>
          <el-option v-for='(item, index) in buildings' :key='index' :label='item.name' :value='item.id'></el-option>
        </el-select>
      </div>
      <div class='row form-group'>
        <label class='col-4'>Meter: </label>
        <el-select ref="submeters" v-model="meter[currentIndex]" class='col'>
          <el-option :value='0' label='All'></el-option>
          <el-option v-for='(item, index) in buildingMeters' :key='index' :label='item.name' :value='item.meter_id'></el-option>
        </el-select>
      </div>
      <!-- <div class="row fromDateChooser form-group">
        <label class='col-4'>From Date: </label>
        <el-date-picker class='col' v-model='start' type='datetime' format='MM/dd/yyyy hh:mm a' :picker-options="{ format: 'hh:mm a'}" value-format='yyyy-MM-ddTHH:mm:00.000Z'>
        </el-date-picker>
      </div>

       <div class="row toDateChooser form-group">
        <label class='col-4'>To Date: </label>
        <el-date-picker class='col' v-model='end' type='datetime' format='MM/dd/yyyy hh:mm a' :picker-options="{ format: 'hh:mm a'}" value-format='yyyy-MM-ddTHH:mm:00.000Z'>
        </el-date-picker>
      </div> -->

      <!-- <div class="row graphTypeChooser form-group">
        <label class='col-4'>Graph Type: </label>
        <el-select v-model="graphtype" class='col'>
          <el-option :value='1' label='Line Chart'></el-option>
          <el-option :value='2' label='Bar Chart'></el-option>
          <el-option :value='3' label='Doughnut Chart'></el-option>
           <el-option :value='4' label='Pie Chart'></el-option> -->
        <!-- </el-select>
      </div> -->

      <!-- <div class="row intervalUnitChooser form-group">
        <label class='col-4'>Interval: </label>
        <el-select class='col' v-model="intunit" >
          <el-option :value="1" label='15 Minutes'></el-option>
          <el-option :value="2" label='1 Hour'></el-option>
          <el-option :value="3" label='1 Day'></el-option>
          <el-option :value="4" label='1 week'></el-option>
          <el-option :value="5" label='1 Month'></el-option>
        </el-select> -->
        <!-- <el-input-number :step="step" class="sharedLine" v-model="interval" controls-position='right'></el-input-number> -->
      <!-- </div> -->
      <div class="row form-group justify-content-center deletebutton" v-if='this.point.length > 1'>
        <b-btn class='col-10' @click='deleteChart()' variant='danger'>Delete Dataset</b-btn>
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
      test: '',

      meter: [],
      name: [],
      point: [],
      group: []
    }
  },
  created () {
    // Populate Temporary Data
    for (let chart of this.block(this.index).charts) {
      // Meter
      if (chart.meters.length > 1) {
        this.meter.push(0)
      } else {
        this.meter.push(chart.meters[0].meter_id)
      }
      // Name
      this.name.push(chart.name)
      // point
      this.point.push(chart.point)
      // group
      this.group.push(chart.group_id)
    }
  },
  asyncComputed: {
    buildings: {
      get: function () {
        return this.$store.dispatch('buildings')
      }
    },
    buildingMeters: {
      get: function () {
        return this.$store.dispatch('buildingMeters', { id: this.group[this.currentIndex] })
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
    }
    // meter: {
    //   get: function () {
    //     if (this.block(this.index).charts[this.currentIndex].meters.length > 1) {
    //       return 0
    //     } else {
    //       return this.block(this.index).charts[this.currentIndex].meters[0].meter_id
    //     }
    //   },
    //   set: function (v) {
    //     if (v !== 0) {
    //       let meter = this.buildingMeters.find(e => e.meter_id === v)
    //       let point = ''
    //       if (meter.type === 'e') {
    //         point = 'accumulated_real'
    //       } else if (meter.type === 's') {
    //         point = 'total'
    //       } else if (meter.type === 'g') {
    //         point = 'cubic_feet'
    //       }
    //       this.$store.dispatch('block', { index: this.index, charts: [{ meters: [meter], index: this.currentIndex, point: point, meter: meter.meter_id }] }).then(() => {
    //         // this.$parent.$refs.chartController.parse()
    //         // if (this.mounted) {
    //         //   this.$store.commit('modifyFlag')
    //         // }
    //       })
    //     } else {
    //       let r = []
    //       for (let meter of this.buildingMeters) {
    //         if (meter.type === 'e') {
    //           r.push(meter)
    //         }
    //       }
    //       this.$store.dispatch('block', { index: this.index, charts: [{ meters: r, index: this.currentIndex, point: 'accumulated_real', meter: 0 }] }).then(() => {
    //         // this.$parent.$refs.chartController.parse()
    //         // if (this.mounted) {
    //         //   this.$store.commit('modifyFlag')
    //         // }
    //       })
    //     }
    //   }
    // },
    // name: {
    //   get: function () {
    //     let n = this.block(this.index).charts[this.currentIndex].name
    //     return n
    //   },
    //   set: function (v) {
    //     this.$store.dispatch('block', { index: this.index, charts: [{ name: v, index: this.currentIndex }] }).then(() => {
    //       // this.$parent.$refs.chartController.parse()
    //       // if (this.mounted) {
    //       //   this.$store.commit('modifyFlag')
    //       // }
    //     })
    //   }
    // },
    // start: {
    //   get: function () {
    //     let s = this.block(this.index).date_start
    //     return s
    //   },
    //   set: function (v) {
    //     this.$store.dispatch('block', { index: this.index, date_start: v }).then(() => {
    //       // this.$parent.$refs.chartController.parse()
    //       // if (this.mounted) {
    //       //   this.$store.commit('modifyFlag')
    //       // }
    //     })
    //   }
    // },
    // end: {
    //   get: function () {
    //     return this.block(this.index).date_end
    //   },
    //   set: function (v) {
    //     this.$store.dispatch('block', { index: this.index, date_end: v }).then(() => {
    //       // this.$parent.$refs.chartController.parse()
    //       // if (this.mounted) {
    //       //   this.$store.commit('modifyFlag')
    //       // }
    //     })
    //   }
    // },
    // point: {
    //   get: function () {
    //     return this.block(this.index).charts[this.currentIndex].point
    //   },
    //   set: function (v) {
    //     this.$store.dispatch('block', { index: this.index, charts: [{ point: v, index: this.currentIndex }] }).then(() => {
    //       // this.$parent.$refs.chartController.parse()
    //       // this.$store.commit('modifyFlag')
    //     })
    //   }
    // },
    // group: {
    //   get: function () {
    //     return this.block(this.index).charts[this.currentIndex].group_id
    //   },
    //   set: function (v) {
    //     this.$store.dispatch('building', { blockIndex: this.index, chartIndex: this.currentIndex, group_id: v }).then(() => {
    //       // this.$parent.$refs.chartController.parse()
    //       // if (this.mounted) {
    //       //   this.$store.commit('modifyFlag')
    //       // }
    //     })
    //   }
    // },
    // unit: {
    //   get: function () {
    //     return this.block(this.index).interval_unit
    //   },
    //   set: function (v) {
    //     this.$store.dispatch('block', { index: this.index, interval_unit: v }).then(() => {
    //       // this.$parent.$refs.chartController.parse()
    //       // if (this.mounted) {
    //       //   this.$store.commit('modifyFlag')
    //       // }
    //     })
    //   }
    // },
    // interval: {
    //   get: function () {
    //     return this.block(this.index).date_interval
    //   },
    //   set: function (v) {
    //     this.$store.dispatch('block', { index: this.index, date_interval: v }).then(() => {
    //       // this.$parent.$refs.chartController.parse()
    //       // if (this.mounted) {
    //       //   this.$store.commit('modifyFlag')
    //       // }
    //     })
    //   }
    // },
    // graphtype: {
    //   get: function () {
    //     return this.block(this.index).graph_type
    //   },
    //   set: function (v) {
    //     this.$store.dispatch('block', { index: this.index, graph_type: v }).then(() => {
    //       // this.$parent.$refs.chartController.parse()
    //     })
    //   }
    // }
  },
  methods: {
    meters: function (i) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('buildingMeters', { id: this.group[i] }).then(r => {
          let p = []
          for (let meter of r) {
            if (this.meter[i] === 0) {
              if (meter.type === 'e') {
                p.push(meter)
              }
            } else {
              if (this.meter[i] === meter.meter_id) {
                p.push(meter)
              }
            }
          }
          resolve(p)
        }).catch(e => {
          reject(e)
        })
      })
    },
    addGroup: function () {
      // this.$store.dispatch('addChart', { index: this.index }).then(() => {
      //   // this.$parent.$refs.chartController.parse()
      //   if (this.mounted) {
      //     this.$store.commit('modifyFlag')
      //   }
      // })
      this.point.push('accumulated_real')
      this.meter.push(0)
      this.group.push(8)
      this.name.push('Untitled Chart')
    },
    saveCharts: async function () {
      let r = []
      for (let i in this.point) {
        r.push({
          point: this.point[i],
          group_id: this.group[i],
          name: this.name[i],
          meters: await this.meters(i)
        })
      }
      return r
    },
    buttonVariant: function (i) {
      if (i === this.currentIndex) {
        return 'primary'
      } else {
        return 'secondary'
      }
    },
    deleteChart: function () {
      this.point.splice(this.currentIndex, 1)
      this.meter.splice(this.currentIndex, 1)
      this.group.splice(this.currentIndex, 1)
      this.name.splice(this.currentIndex, 1)
      this.currentIndex = 0

      // this.$parent.$refs.chartController.parse()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style>
.el-date-editor > .el-input__prefix {
  padding-left: 1em !important;
}
.el-date-editor > .el-input__suffix {
  padding-right: 1em !important;
}
</style>
<style scoped>
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
.controlSection {
  margin-left: 1em;
  margin-right: 1em;
}
.deletebutton {
  padding-bottom: 1em;
}

</style>
