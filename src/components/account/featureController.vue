<template>
    <el-row ref="controlArea">
      <el-row class="pad-bottom" ref="indexChooser" v-if='!story.public'>
        <el-col :span='24'>
          <el-button class="indexButton"  v-for="(point, index) in this.form" :type='buttonVariant(index)' @click="changeIndex(index)" :key='index'>{{ index + 1 }}</el-button>
          <el-button class="indexButton" @click="addGroup()">+</el-button>
        </el-col>
      </el-row>
      <el-form ref='form' :model='form[currentIndex]' label-width="120px" size='large' label-position='left'>
        <el-form-item v-if='!story.public' prop='group' label='Building: ' :rules="{required: true, message: 'A building is required', trigger: 'blur'}">
          <!-- <label class='col-4'>Building: </label> -->
          <el-select ref="groups" v-model="form[currentIndex].group" filterable placeholder="Building" style='width: 100%;' @change='form[currentIndex].meter = 0'>
            <el-option v-for='(item, index) in buildings' :key='index' :label='item.name' :value='item.id'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if='!story.public' prop='name' label='Set Name: ' :rules="{required: true, message: 'A set name is required', trigger: 'blur'}">
          <!-- <label class='col-4'>Name:</label> -->
          <el-input type="text" v-model="form[currentIndex].name" style='width: 100%;'></el-input>
        </el-form-item>

        <el-form-item :rules="{required: true, message: 'A measurement is required', trigger: 'blur'}" prop='point' label='Measurement: '>
          <!-- <label class='col-4'>Point: </label> -->
          <el-select v-model="form[currentIndex].point" style='width: 100%;'>
            <!-- Electrical Meter Options -->
            <el-option value="accumulated_real" v-if="currentType === 'e'" label='Net Energy Usage (kWh)'></el-option>
            <el-option value="real_power" v-if="currentType === 'e'" label='Real Power (W)'></el-option>
            <el-option value="reactive_power" v-if="currentType === 'e'" label='Reactive Power (VAR)'></el-option>
            <el-option value="apparent_power" v-if="currentType === 'e'" label='Apparent Power (VA)'></el-option>
            <el-option value="real_a" v-if="currentType === 'e'" label='Real Power, Phase A (W)'></el-option>
            <el-option value="real_b" v-if="currentType === 'e'" label='Real Power, Phase B (W)'></el-option>
            <el-option value="real_c" v-if="currentType === 'e'" label='Real Power, Phase C (W)'></el-option>
            <el-option value="reactive_a" v-if="currentType === 'e'" label='Reactive Power, Phase A (VAR)'></el-option>
            <el-option value="reactive_b" v-if="currentType === 'e'" label='Reactive Power, Phase B (VAR)'></el-option>
            <el-option value="reactive_c" v-if="currentType === 'e'" label='Reactive Power, Phase C (VAR)'></el-option>
            <el-option value="apparent_a" v-if="currentType === 'e'" label='Apparent Power, Phase A (VA)'></el-option>
            <el-option value="apparent_b" v-if="currentType === 'e'" label='Apparent Power, Phase B (VA)'></el-option>
            <el-option value="apparent_c" v-if="currentType === 'e'" label='Apparent Power, Phase C (VA)'></el-option>
            <el-option value="pf_a" v-if="currentType === 'e'" label='Power Factor, Phase A'></el-option>
            <el-option value="pf_b" v-if="currentType === 'e'" label='Power Factor, Phase B'></el-option>
            <el-option value="pf_c" v-if="currentType === 'e'" label='Power Factor, Phase C'></el-option>
            <el-option value="vphase_ab" v-if="currentType === 'e'" label='Voltage Phase, Phase A-B (V)'></el-option>
            <el-option value="vphase_bc" v-if="currentType === 'e'" label='Voltage Phase, Phase B-C (V)'></el-option>
            <el-option value="vphase_ac" v-if="currentType === 'e'" label='Voltage Phase, Phase A-C (V)'></el-option>
            <el-option value="vphase_an" v-if="currentType === 'e'" label='Voltage Phase, Phase A-N (V)'></el-option>
            <el-option value="vphase_bn" v-if="currentType === 'e'" label='Voltage Phase, Phase B-N (V)'></el-option>
            <el-option value="vphase_cn" v-if="currentType === 'e'" label='Voltage Phase, Phase C-N (V)'></el-option>
            <el-option value="cphase_a" v-if="currentType === 'e'" label='Current Phase, Phase A (A)'></el-option>
            <el-option value="cphase_b" v-if="currentType === 'e'" label='Current Phase, Phase B (A)'></el-option>
            <el-option value="cphase_c" v-if="currentType === 'e'" label='Current Phase, Phase C (A)'></el-option>

            <!-- Gas Meter Options -->
            <el-option value="cubic_feet" v-if="currentType === 'g'" label='Accumulated Usage'></el-option>

            <!-- Steam Meter Options -->
            <el-option value="total" v-if="currentType === 's'" label='Accumulated Usage'></el-option>

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
      <el-row class="deletebutton" v-if='this.form.length > 1'>
        <el-col :span='10'>
          <el-button @click='deleteChart()' type='danger'>Delete Dataset</el-button>
        </el-col>
      </el-row>

    </el-row>
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
          group: chart.group_id,
          id: chart.id
        })
      }
    } else {
      this.form.push({
        meter: null,
        name: null,
        group: null,
        point: null,
        id: null
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
          meters: await this.meters(i),
          id: this.form[i].id
        })
      }
      return r
    },
    buttonVariant: function (i) {
      if (i === this.currentIndex) {
        return 'primary'
      } else {
        return 'info'
      }
    },
    deleteChart: function () {
      let r = this.form.splice(this.currentIndex, 1)
      if (r[0].id) {
        this.$store.commit('removeChart', { blockIndex: this.index, chartIndex: this.currentIndex })
      }

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
