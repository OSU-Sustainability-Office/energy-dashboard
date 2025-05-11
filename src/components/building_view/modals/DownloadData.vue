<!--
  Filename: DownloadData.vue
  Info: This is the modal that allows the user to download data from the server.
  It allows the user to select a date range, interval, and points to download.
-->

<template>
  <el-dialog v-model="visible" title="Download Data" width="80%" @open="updateForm()">
    <el-form label-width="150px" label-position="left" :model="form" ref="form">
      <el-form-item
        label="From Date: "
        :rules="[
          {
            validator: dateValidator,
            type: 'date',
            required: true,
            message: 'A from date is required',
            trigger: 'change'
          }
        ]"
        prop="start"
      >
        <!-- <label class='col-4 text-left'>From Date: </label> -->
        <el-date-picker
          v-model="form.start"
          type="datetime"
          format="MM/DD/YYYY hh:mm a"
          :picker-options="{ format: 'hh:mm a' }"
          style="width: 100%"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item
        label="To Date: "
        :rules="{
          validator: dateValidator,
          type: 'date',
          required: true,
          message: 'A to date is required',
          trigger: 'change'
        }"
        prop="end"
      >
        <!-- <label class='col-4 text-left'>To Date: </label> -->
        <el-date-picker
          v-model="form.end"
          type="datetime"
          format="MM/DD/YYYY hh:mm a"
          :picker-options="{ format: 'hh:mm a' }"
          style="width: 100%"
        >
        </el-date-picker>
      </el-form-item>
      <el-form-item
        label="Interval: "
        :rules="{
          required: true,
          message: 'An interval is required',
          trigger: 'blur'
        }"
        prop="intUnit"
      >
        <!-- <label class='col-4'>Interval: </label> -->
        <el-select v-model="form.intUnit" style="width: 100%">
          <el-option :value="1" label="15 Minutes"></el-option>
          <el-option :value="2" label="1 Hour"></el-option>
          <el-option :value="3" label="1 Day"></el-option>
          <el-option :value="4" label="1 Week"></el-option>
          <el-option :value="5" label="1 Month"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="Points: "
        :rules="{
          required: true,
          message: 'Meter points are required',
          trigger: 'blur'
        }"
        prop="points"
      >
        <el-select filterable multiple v-model="form.points" style="width: 100%">
          <el-option
            v-for="point in meterPoints"
            :value="point.value"
            :label="point.label"
            :key="point.value"
          ></el-option>
        </el-select>
      </el-form-item>
      <el-form-item label="Buildings: ">
        <el-row justify="start" class="building_flex">
          <el-col v-for="building in form.buildings" :label="building.name" :key="building.id" class="groupChecker">
            <span class="buildingTitle">{{ building.name }}</span>
            <el-checkbox-group v-model="building.groups">
              <div v-for="group in groups(building.id)" :key="group.id" class="checkGroup">
                <el-checkbox :value="group.id" :key="group.id"
                  ><span class="groupTitle">{{ group.name }}</span></el-checkbox
                ><br />
              </div>
            </el-checkbox-group>
          </el-col>
          <el-col v-for="i in 10" :key="i"> </el-col>
        </el-row>
        <el-row v-if="form.buildings.length === 0">
          <el-col class="noBuildingText"> No Buildings selected to download data from </el-col>
        </el-row>
        <el-row v-if="buildingsFiltered.length > 0" style="width: 100%">
          <el-col :sm="8" :md="6" :lg="4">
            <el-button @click="addBuilding()" type="primary" class="buildingAddButton"> Add Building</el-button>
          </el-col>
          <el-col :sm="16" :md="18" :lg="20">
            <el-select v-model="addBuildingId" class="buildingAddSelect" filterable>
              <el-option
                v-for="building in buildingsFiltered"
                :value="building.id"
                :label="building.name"
                :key="building.id"
              />
            </el-select>
          </el-col>
        </el-row>
      </el-form-item>
    </el-form>
    <template v-slot:footer>
      <span class="footer-buttons">
        <el-button @click="visible = false" type="info"> Cancel </el-button>
        <el-button @click="download()" type="primary"> Download </el-button>
      </span>
    </template>
  </el-dialog>
</template>

<script>
import ChartModifier from '@/store/chart_modifiers/index'
import JSZip from 'jszip'

export default {
  data () {
    return {
      currentIndex: 0,
      addBuildingId: 0,
      form: {
        start: '',
        end: '',
        intUnit: 5,
        buildings: [],
        points: []
      }
    }
  },
  watch: {
    buildingsFiltered: {
      immediate: true,
      handler: function (value) {
        if (value.length > 0) this.addBuildingId = value[0].id
      }
    }
  },
  computed: {
    visible: {
      get () {
        return this.$store.getters['modalController/modalName'] === 'DownloadData'
      },

      set (value) {
        if (value === false) {
          this.$store.dispatch('modalController/closeModal')
        }
      }
    },
    meterPoints: {
      get () {
        let points = []
        for (let building of this.form.buildings) {
          for (let group of building.groups) {
            let meters = this.$store.getters[this.$store.getters['map/meterGroup'](group).path + '/meters']
            for (let meter of meters) {
              for (let point of meter.points) {
                let index = points.map(o => o.value).indexOf(point.value)
                if (index < 0) points.push(point)
              }
            }
          }
        }
        return points
      }
    },
    buildingsFiltered: {
      get () {
        if (!this.buildings) return []
        let buildingsCopy = [...this.buildings]
        let buildingIds = buildingsCopy.map(o => parseInt(o.id))
        for (let building of this.form.buildings) {
          let id = building.id
          let index = buildingIds.indexOf(parseInt(id))
          if (index >= 0) buildingsCopy.splice(index, 1)
          buildingIds = buildingsCopy.map(o => parseInt(o.id))
        }
        return buildingsCopy
      }
    },

    buildings: {
      get () {
        return this.$store.getters['map/buildings']
      }
    }
  },

  methods: {
    addBuilding: function () {
      const building = {
        id: this.addBuildingId,
        name: this.$store.getters['map/building'](this.addBuildingId).name,
        groups: []
      }
      this.form.buildings.push(building)
    },

    groups: function (buildingId) {
      return this.$store.getters[this.$store.getters['map/building'](buildingId).path + '/meterGroups']
    },

    download: async function () {
      let zip = new JSZip()
      const map = {
        accumulated_real: 'Net Energy Usage (kWh)',
        real_power: 'Real Power (kW)',
        reactive_power: 'Reactive Power (kVAR)',
        apparent_power: 'Apparent Power (VA)',
        real_a: 'Real Power, Phase A (kW)',
        real_b: 'Real Power, Phase B (kW)',
        real_c: 'Real Power, Phase C (kW)',
        reactive_a: 'Reactive Power, Phase A (kVAR)',
        reactive_b: 'Reactive Power, Phase B (kVAR)',
        reactive_c: 'Reactive Power, Phase C (kVAR)',
        pf_a: 'Power Factor, Phase A',
        pf_b: 'Power Factor, Phase B',
        pf_c: 'Power Factor, Phase C',
        vphase_ab: 'Voltage, Phase A-B (V)',
        vphase_bc: 'Voltage, Phase B-C (V)',
        vphase_ac: 'Voltage, Phase A-C (V)',
        vphase_an: 'Voltage, Phase A-N (V)',
        vphase_bn: 'Voltage, Phase B-N (V)',
        vphase_cn: 'Voltage, Phase C-N (V)',
        cphase_a: 'Current, Phase A (A)',
        cphase_b: 'Current, Phase B (A)',
        cphase_c: 'Current, Phase C (A)',
        cubic_feet: 'Total Natural Gas (CF)',
        instant: 'Instant',
        maximum: 'Maximum',
        minimum: 'Minimum',
        rate: 'Natural Gas Rate (CFm)',
        total: 'Steam (Lbs)',
        input: 'Steam Input',
        apparent_a: 'Apparent Power, Phase A (VA)',
        apparent_b: 'Apparent Power, Phase B (VA)',
        apparent_c: 'Apparent Power, Phase C (VA)',
        baseline_percentage: 'Percentage (%)'
      }
      let promises = []
      for (let point of this.form.points) {
        let groups = this.form.buildings.reduce((acc, cur) => {
          return acc.concat(cur.groups)
        }, [])
        const req = {
          point: point,
          dateStart: parseInt(this.form.start / 1000),
          dateEnd: parseInt(this.form.end / 1000),
          intervalUnit: this.interval(this.form.intUnit),
          dateInterval: this.date(this.form.intUnit),
          graphType: 1
        }
        for (let group of groups) {
          let groupPoints = this.$store.getters[this.$store.getters['map/meterGroup'](group).path + '/points']
          let findex = groupPoints.map(o => o.value).indexOf(req.point)
          if (findex >= 0) {
            promises.push(
              new Promise(async (resolve, reject) => {
                const chartModifier = ChartModifier(req.graphType, req.point)
                await chartModifier.preGetData(req, this.$store, null)
                let data = await this.$store.dispatch(
                  this.$store.getters['map/meterGroup'](group).path + '/getData',
                  req
                )
                // Mimic what the chart modifier expects so there is no issues
                let chartData = {
                  label: '',
                  backgroundColor: '',
                  borderColor: '',
                  fill: false,
                  showLine: true,
                  spanGaps: false,
                  data: data
                }

                await chartModifier.postGetData(chartData, req, this.$store, null)
                resolve({
                  point: map[point],
                  group: this.$store.getters['map/meterGroup'](group).name,
                  data: chartData.data
                })
              })
            )
          }
        }
      }
      let dlData = await Promise.all(promises)
      for (let dl of dlData) {
        let organizedData = [`Time,${dl.point}`]
        for (let d of dl.data) {
          organizedData.push(`${d.x},${d.y}`)
        }
        let stringRep = organizedData.join('\n')
        zip.file(`${dl.group} ${dl.point}.csv`, stringRep)
      }
      zip.generateAsync({ type: 'blob' }).then(blob => {
        let a = window.document.createElement('a')
        a.href = window.URL.createObjectURL(blob, { type: 'text/plain' })
        a.download = `EnergyData ${new Date(this.form.start).toString()} - ${new Date(this.form.end).toString()}`
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })
    },

    updateForm: function () {
      this.form.buildings = []
      this.form.points = []
      this.form.start = ''
      this.form.end = ''
      this.form.intUnit = 5

      const path = this.$store.getters['modalController/data'].view
      for (let block of this.$store.getters[path + '/blocks']) {
        let start = this.$store.getters[block.path + '/dateStart']
        let end = this.$store.getters[block.path + '/dateEnd']

        let interval = this.$store.getters[block.path + '/dateInterval']
        let unit = this.$store.getters[block.path + '/intervalUnit']

        let intUnit = this.intUnit(unit, interval)

        if (!this.form.start || this.form.start === '' || parseInt(start) < this.form.start) {
          this.form.start = parseInt(start)
        }
        if (!this.form.end || this.form.end === '' || parseInt(end) > this.form.end) {
          this.form.end = parseInt(end)
        }
        if (!this.form.intUnit || this.form.intUnit === '' || parseInt(intUnit) < this.form.intUnit) {
          this.form.intUnit = parseInt(intUnit)
        }

        for (let chart of this.$store.getters[block.path + '/charts']) {
          let mg = chart.meterGroupPath
          let bgPath = this.$store.getters[mg + '/building']
          if (this.form.points.indexOf(chart.point) < 0) {
            this.form.points.push(chart.point)
          }
          const bldg = {
            name: this.$store.getters[bgPath + '/name'],
            id: this.$store.getters[bgPath + '/id'],
            groups: [this.$store.getters[mg + '/id']]
          }
          let index = this.form.buildings.map(o => o.id).indexOf(bldg.id)
          if (index >= 0) {
            this.form.buildings[index].groups.push(bldg.groups[0])
          } else {
            this.form.buildings.push(bldg)
          }
        }
      }
    },
    dateValidator: function (rule, value, callback) {
      if (!value) {
        callback(new Error(rule.message))
      } else {
        callback()
      }
    },
    interval: function (intUnit) {
      switch (intUnit) {
        case 1:
          return 'minute'
        case 2:
          return 'hour'
        case 3:
          return 'day'
        case 4:
          return 'day'
        case 5:
          return 'month'
        default:
          return 'minute'
      }
    },
    date: function (intUnit) {
      switch (intUnit) {
        case 1:
          return 15
        case 2:
          return 1
        case 3:
          return 1
        case 4:
          return 7
        case 5:
          return 1
        default:
          return 15
      }
    },

    intUnit: function (intervalUnit, dateInterval) {
      if (dateInterval === 15 && intervalUnit === 'minute') {
        return 1
      } else if (dateInterval === 1 && intervalUnit === 'hour') {
        return 2
      } else if (dateInterval === 1 && intervalUnit === 'day') {
        return 3
      } else if (dateInterval === 7 && intervalUnit === 'day') {
        return 4
      } else if (dateInterval === 1 && intervalUnit === 'month') {
        return 5
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.stage {
  position: relative !important;
  top: 0 !important;
  height: auto;
}
.noBuildingText {
  height: 50px;
  text-align: center;
}
.building_flex {
  flex-wrap: wrap !important;
  overflow-x: hidden;
  padding-bottom: 20px;
}
.building_flex > * {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  min-width: 250px;
}
.buildingTitle {
  padding: 0;
  margin: 0;
  font-weight: 800;
}
.groupTitle {
  font-weight: 400;
}
.checkGroup {
  margin: 0;
  padding-left: 5px;
  height: 20px;
}
.groupChecker {
  padding-bottom: 20px;
}
.footer-buttons {
  display: flex;
  justify-content: flex-end;
}
.buildingContainer {
  width: 100%;
}
:deep(.buildingAddSelect .el-select__wrapper.is-filterable),
:deep(.buildingAddSelect .el-select__input) {
  cursor: pointer;
}
</style>
