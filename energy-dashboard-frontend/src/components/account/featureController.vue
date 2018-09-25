<template>
    <div ref="controlArea">
      <div class="row pad-bottom" ref="indexChooser" v-if='!story.public'>
        <b-button class="indexButton"  v-for="(point, index) in this.form" :variant='buttonVariant(index)' @click="changeIndex(index)" :key='index'>{{ index + 1 }}</b-button>
        <b-button class="indexButton" @click="addGroup()">+</b-button>
      </div>
      <el-form ref='form' :model='form[currentIndex]' label-width="120px" size='large' label-position='left'>
        <el-form-item v-if='!story.public' prop='name' label='Name: ' :rules="{required: true, message: 'A name is required', trigger: 'blur'}">
          <!-- <label class='col-4'>Name:</label> -->
          <el-input type="text" v-model="form[currentIndex].name" style='width: 100%;'></el-input>
        </el-form-item>

        <el-form-item :rules="{required: true, message: 'A measurement is required', trigger: 'blur'}" prop='point' label='Measurement: '>
          <!-- <label class='col-4'>Point: </label> -->
          <el-select v-model="form[currentIndex].point" style='width: 100%;'>
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
        </el-form-item>

        <el-form-item v-if='!story.public' prop='group' label='Building: ' :rules="{required: true, message: 'A building is required', trigger: 'blur'}">
          <!-- <label class='col-4'>Building: </label> -->
          <el-select ref="groups" v-model="form[currentIndex].group" filterable placeholder="Building" style='width: 100%;'>
            <el-option v-for='(item, index) in buildings' :key='index' :label='item.name' :value='item.id'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item prop='meter' label='Meter: ' :rules="{required: true, message: 'A meter is required', trigger: 'blur'}">
          <!-- <label class='col-4'>Meter: </label> -->
          <el-select ref="submeters" v-model="form[currentIndex].meter" style='width: 100%;'>
            <el-option :value='0' label='All'></el-option>
            <el-option v-for='(item, index) in buildingMeters' :key='index' :label='item.name' :value='item.meter_id'></el-option>
          </el-select>
        </el-form-item>
      </el-form>
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
      <div class="row form-group justify-content-center deletebutton" v-if='this.form.length > 1'>
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
  props: ['index', 'datasets'],
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
      group: [],
      form: []
    }
  },
  created () {
    // Populate Temporary Data
    if (this.index < this.story.blocks.length) {
      for (let chart of this.block(this.index).charts) {
        // Meter
        let meter = 0
        if (chart.meters.length === 1) {
          meter = chart.meters[0].meter_id
        }
        // Name
        this.form.push({
          name: chart.name,
          meter: meter,
          point: chart.point,
          group: chart.group_id
        })
      }
    } else {
      this.form.push({
        meter: null,
        name: null,
        group: null,
        point: null
      })
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
        if (this.form.length === 0) {
          return
        }
        return this.$store.dispatch('buildingMeters', { id: this.form[this.currentIndex].group })
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
  },
  methods: {
    meters: function (i) {
      return new Promise((resolve, reject) => {
        this.$store.dispatch('buildingMeters', { id: this.group[i] }).then(r => {
          let p = []
          for (let meter of r) {
            if (this.form[i].meter === 0) {
              if (meter.type === 'e') {
                p.push(meter)
              }
            } else {
              if (this.form[i].meter === meter.meter_id) {
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
    changeIndex: function (index) {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.currentIndex = index
        }
      })
    },
    addGroup: function () {
      // this.$store.dispatch('addChart', { index: this.index }).then(() => {
      //   // this.$parent.$refs.chartController.parse()
      //   if (this.mounted) {
      //     this.$store.commit('modifyFlag')
      //   }
      // })
      // this.point.push('accumulated_real')
      // this.meter.push(0)
      // this.group.push(8)
      // this.name.push('Untitled Chart')
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.form.push({
            meter: null,
            group: null,
            name: null,
            point: null
          })
          this.currentIndex++
        }
      })
    },
    saveCharts: async function () {
      let r = []
      for (let i in this.form) {
        r.push({
          point: this.form[i].point,
          group_id: this.form[i].group,
          name: this.form[i].name,
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
      this.form.splice(this.currentIndex, 1)
      this.currentIndex = 0

      // this.$parent.$refs.chartController.parse()
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pad-bottom {
  padding-bottom: 1em;
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
