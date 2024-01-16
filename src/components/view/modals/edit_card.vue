<!--
  Filename: edit_card.vue
  Info: Modal for editing "full-view" chart settings.
-->
<template>
  <el-dialog
    size="lg"
    :visible.sync="visible"
    :title="form.new ? 'New Block' : 'Edit Block'"
    width="80%"
    @open="updateForm()"
  >
    <el-form label-width="150px" label-position="left" :model="form" ref="form">
      <el-form-item
        label="Name: "
        :rules="{
          required: true,
          message: 'A name is required',
          trigger: 'blur'
        }"
        prop="name"
        v-if="personalView"
      >
        <!-- <label class='col-4'>Name:</label> -->
        <el-input type="text" v-model="form.name" style="width: 100%"></el-input>
      </el-form-item>
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
          format="MM/dd/yyyy hh:mm a"
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
          format="MM/dd/yyyy hh:mm a"
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
          <el-option :value="4" label="1 week"></el-option>
          <el-option :value="5" label="1 Month"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        label="Graph Type: "
        :rules="{
          required: true,
          message: 'A graph type is required',
          trigger: 'blur'
        }"
        prop="graphType"
        v-if="personalView"
      >
        <!-- <label class='col-4'>Graph Type: </label> -->
        <el-select v-model="form.graphType" style="width: 100%">
          <el-option :value="1" label="Line Chart"></el-option>
          <el-option :value="2" label="Bar Chart"></el-option>
          <el-option :value="3" label="Doughnut Chart"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="currentIndex < form.sets.length && !personalView && (compareOneBuildingView || !compareView)"
        prop="meter"
        label="Meter: "
        :rules="{
          required: true,
          message: 'A meter is required',
          trigger: 'blur'
        }"
      >
        <el-select
          ref="submeters"
          v-model="form.sets[currentIndex].meter"
          style="width: 100%"
          @change="meterChange(currentIndex)"
        >
          <el-option v-for="item in meters" :key="item.path" :label="item.name" :value="item.path"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="currentIndex < form.sets.length && !personalView && (compareOneBuildingView || !compareView)"
        :rules="{
          required: true,
          message: 'A measurement is required',
          trigger: 'blur'
        }"
        prop="point"
        label="Measurement: "
      >
        <el-select v-model="form.sets[currentIndex].point" style="width: 100%">
          <el-option
            v-for="(point, index) in meterPoints"
            :value="point.value"
            :label="point.label"
            :key="index"
          ></el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <div v-if="personalView">
      <label class="setlabel">Datasets: </label>
      <el-row ref="controlArea">
        <el-row class="pad-bottom" ref="indexChooser">
          <el-col :span="24">
            <el-button
              class="indexButton"
              v-for="(point, index) in this.form.sets"
              :type="buttonVariant(index)"
              @click="changeIndex(index)"
              :key="index"
              >{{ index + 1 }}</el-button
            >
            <el-button class="indexButton" @click="addGroup()">+</el-button>
          </el-col>
        </el-row>
        <el-form ref="form" :model="form.sets[currentIndex]" label-width="150px" size="large" label-position="left">
          <el-form-item
            v-if="currentIndex < form.sets.length"
            prop="building"
            label="Building: "
            :rules="{
              required: true,
              message: 'A building is required',
              trigger: 'blur'
            }"
          >
            <el-select
              ref="groups"
              v-model="form.sets[currentIndex].building"
              filterable
              placeholder="Building"
              style="width: 100%"
              @change="
                form.sets[currentIndex].meter = null
                form.sets[currentIndex].point = null
              "
            >
              <el-option
                v-for="(item, index) in buildings"
                :key="index"
                :label="item.name"
                :value="item.path"
              ></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="currentIndex < form.sets.length"
            prop="name"
            label="Set Name: "
            :rules="{
              required: true,
              message: 'A set name is required',
              trigger: 'blur'
            }"
          >
            <el-input type="text" v-model="form.sets[currentIndex].name" style="width: 100%"></el-input>
          </el-form-item>
          <el-form-item
            v-if="currentIndex < form.sets.length"
            prop="meter"
            label="Meter: "
            :rules="{
              required: true,
              message: 'A meter is required',
              trigger: 'blur'
            }"
          >
            <el-select
              ref="submeters"
              v-model="form.sets[currentIndex].meter"
              style="width: 100%"
              @change="meterChange(currentIndex)"
            >
              <el-option v-for="item in meters" :key="item.path" :label="item.name" :value="item.path"></el-option>
            </el-select>
          </el-form-item>
          <el-form-item
            v-if="currentIndex < form.sets.length"
            :rules="{
              required: true,
              message: 'A measurement is required',
              trigger: 'blur'
            }"
            prop="point"
            label="Measurement: "
          >
            <el-select v-model="form.sets[currentIndex].point" style="width: 100%">
              <el-option
                v-for="(point, index) in meterPoints"
                :value="point.value"
                :label="point.label"
                :key="index"
              ></el-option>
            </el-select>
          </el-form-item>
        </el-form>
        <el-row class="deletebutton" v-if="form.sets.length > 1">
          <el-col :span="10">
            <el-button @click="deleteChart()" type="danger">Delete Dataset</el-button>
          </el-col>
        </el-row>
      </el-row>
    </div>
    <span slot="footer">
      <el-button @click="cardDelete()" type="danger" v-if="personalView && $store.getters['modalController/data'].path">
        Delete
      </el-button>
      <el-button @click="cardSave()" type="primary"> Ok </el-button>
      <el-tooltip
        v-if="compareOneBuildingView"
        class="item"
        effect="dark"
        content='Click to add time period (not saved until you click "Ok")'
        placement="top"
      >
        <el-button @click="timeSave()" type="primary"> Add Time Period </el-button>
      </el-tooltip>

      <el-button @click="visible = false" type="info"> Cancel </el-button>
      <div class="savedTimesDiv" v-if="compareOneBuildingView">
        <p class="savedTimesP" v-if="this.form.tempMultStart.length > 0">Time Periods to be Compared</p>

        <span type="info" class="savedTimesButton" v-for="(item, index) in form.tempMultStart" :key="index">
          <!-- Since tempMultStart and tempMultEnd share the same array lengths it *should* be fine to call form.tempMultEnd[index]-->
          {{ index + 1 }}: {{ convertTimeStamps(new Date(item)) }} to
          {{ convertTimeStamps(new Date(form.tempMultEnd[index])) }}

          <i class="el-icon-close deleteTimeButton" @click="deleteTimePeriod(index)"></i>
        </span>
      </div>
    </span>
  </el-dialog>
</template>

<script>
export default {
  data () {
    return {
      currentIndex: 0,
      form: {
        name: '',
        new: true,
        start: '',
        end: '',
        intUnit: 1,
        graphType: 1,
        sets: [],
        tempMultStart: [],
        tempMultEnd: []
      }
    }
  },
  computed: {
    visible: {
      get () {
        return this.$store.getters['modalController/modalName'] === 'edit_card'
      },

      set (value) {
        if (value === false) {
          this.$store.dispatch('modalController/closeModal')
          this.cancelTimeSave()
        }
      }
    },
    compareView: {
      get () {
        return this.$route.path.includes('compare')
      }
    },
    // Check only one building is in comparison, e.g. for "save time period" button
    compareOneBuildingView: {
      get () {
        return this.$route.path.includes('compare') && JSON.parse(JSON.stringify(this.form.sets)).length === 1
      }
    },
    personalView: {
      get () {
        let viewPath = this.$store.getters['modalController/data'].path
        if (!viewPath) {
          viewPath = this.$store.getters['modalController/data'].view
        } else {
          viewPath = viewPath.split('/')
          viewPath.pop()
          viewPath = viewPath.join('/')
        }
        if (viewPath) {
          if (this.$store.getters[viewPath + '/user'] === this.$store.getters['user/onid']) {
            return true
          }
        }
        return false
      }
    },

    buildings: {
      get () {
        return this.$store.getters['map/buildings']
      }
    },

    meters: {
      get () {
        return this.$store.getters[this.form.sets[this.currentIndex].building + '/meterGroups']
      }
    },

    meterPoints: {
      get () {
        return this.$store.getters[this.form.sets[this.currentIndex].meter + '/points']
      }
    }
  },

  methods: {
    cardDelete: async function () {
      let blockPath = this.$store.getters['modalController/data'].path
      let blockId = this.$store.getters[blockPath + '/id']
      let viewPath = blockPath.split('/')
      viewPath.pop()
      viewPath = viewPath.join('/')

      this.$store.dispatch(viewPath + '/deleteBlock', blockId)
      this.visible = false
    },

    cardSave: async function () {
      let blockPath = this.$store.getters['modalController/data'].path
      if (!blockPath) {
        let view = this.$store.getters['modalController/data'].view
        blockPath = await this.$store.dispatch(view + '/newBlock', {
          dateStart: this.form.start,
          dateEnd: this.form.end,
          graphType: this.form.graphType,
          name: this.form.name,
          dateInterval: this.date(this.form.intUnit),
          intervalUnit: this.interval(this.form.intUnit)
        })
      } else {
        console.log(this.form.start)
        this.$store.dispatch(blockPath + '/update', {
          dateStart: this.form.start,
          dateEnd: this.form.end,
          graphType: this.form.graphType,
          name: this.form.name,
          dateInterval: this.date(this.form.intUnit),
          intervalUnit: this.interval(this.form.intUnit)
        })
      }

      const charts = this.$store.getters[blockPath + '/charts']
      console.log(charts)
      console.log(this.form.sets)

      for (let index in this.form.sets) {
        if (
          index < charts.length ||
          (this.form.sets[0].multStart && this.form.sets[0].multStart.length < charts[0].multStart.length)
        ) {
          console.log('Conditions met')

          const chartPath = charts[index].path
          // console.log(chartPath)
          this.form.sets[0].multStart = this.form.tempMultStart
          this.form.sets[0].multEnd = this.form.tempMultEnd
          // console.log(this.form.sets[0])
          this.$store.dispatch(chartPath + '/update', this.form.sets[index])
          // console.log(this.$store.getters[blockPath + '/charts'])
          if (this.$route.path.includes('building')) {
            this.$store.commit(chartPath + '/name', this.$store.getters[chartPath + '/pointString'])
          }
        } else {
          this.$store.dispatch(blockPath + '/newChart', this.form.sets[index])
        }
      }
      if (this.form.sets.length < charts.length) {
        for (let index = this.form.sets.length; index < charts.length; index++) {
          this.$store.dispatch(blockPath + '/removeChart', charts[index].path.split('/').pop())
        }
      }

      this.visible = false
    },

    timeSave: function () {
      // Made a dummy temporary state array because directly pushing to this.form.sets[0].multStart caused
      // issues with state.getters updating too soon, inconsistencies with converting Unix to English in chart.module.js
      this.form.tempMultStart.push(this.form.start)
      this.form.tempMultEnd.push(this.form.end)
    },

    // Called whenever the edit modal is closed (cancel or x button)
    // Resets tempMultStart and tempMultEnd to match what's currently in global state (store > getters > chart > multStart/End)
    cancelTimeSave: function () {
      let blockPath = this.$store.getters['modalController/data'].path
      const charts = this.$store.getters[blockPath + '/charts']
      const chartPath = charts[0].path
      this.form.tempMultStart = JSON.parse(JSON.stringify(this.$store.getters[chartPath + '/multStart']))
      this.form.tempMultEnd = JSON.parse(JSON.stringify(this.$store.getters[chartPath + '/multEnd']))
    },

    // convert Unix time to English (to nearest minute), taken from src\components\charts\linechart.js
    convertTimeStamps: function (d) {
      let meridiem = 'am'
      let hours = d.getHours()
      if (hours > 12) {
        hours -= 12
        meridiem = 'pm'
      } else if (hours === 0) {
        hours = 12
      }
      let minutes = d.getMinutes()
      if (minutes < 10) {
        minutes = '0' + minutes
      }
      let year = d.getYear().toString().slice(1)
      const dayCodes = ['Sun', 'Mon', 'Tues', 'Wed', 'Thur', 'Fri', 'Sat']
      return (
        dayCodes[d.getDay()] +
        ' ' +
        (d.getMonth() + 1).toString() +
        '/' +
        d.getDate() +
        '/' +
        year +
        ' ' +
        hours +
        ':' +
        minutes +
        ' ' +
        meridiem
      )
    },

    deleteTimePeriod: function (index) {
      console.log('Form: ', this.form)

      this.form.tempMultStart.splice(index, 1)
      this.form.tempMultEnd.splice(index, 1)

      console.log('Form: ', this.form)
    },

    deleteChart: function () {
      this.form.sets.splice(this.currentIndex, 1)
      this.currentIndex = 0
    },

    updateForm: function () {
      const blockPath = this.$store.getters['modalController/data'].path
      if (blockPath) {
        this.form.new = false

        this.form.name = this.$store.getters[blockPath + '/name']
        this.form.start = this.$store.getters[blockPath + '/dateStart']
        this.form.end = this.$store.getters[blockPath + '/dateEnd']
        this.form.intUnit = this.intUnit(
          this.$store.getters[blockPath + '/intervalUnit'],
          this.$store.getters[blockPath + '/dateInterval']
        )
        this.form.graphType = this.$store.getters[blockPath + '/graphType']

        this.form.sets = []
        for (let chart of this.$store.getters[blockPath + '/charts']) {
          console.log(chart)
          let chartSet = {
            name: chart.name,
            building: this.$store.getters[chart.meterGroupPath + '/building'],
            meter: chart.meterGroupPath,
            point: chart.point
          }
          if (this.compareOneBuildingView) {
            let blockpath = this.$store.getters['modalController/data'].path
            // console.log(blockpath)
            let searchTerm = 'block_'
            let chartIndex = blockpath.indexOf(searchTerm)
            // console.log(blockpath.slice(chartIndex + searchTerm.length))
            let blockID = blockpath.slice(chartIndex + searchTerm.length)
            // console.log(this.$store.getters[blockpath + '/chart_' + blockID + '/multStart'])
            chartSet = {
              name: chart.name,
              building: this.$store.getters[chart.meterGroupPath + '/building'],
              meter: chart.meterGroupPath,
              point: chart.point,
              multStart: this.$store.getters[blockpath + '/chart_' + blockID + '/multStart'],
              multEnd: this.$store.getters[blockpath + '/chart_' + blockID + '/multEnd']
            }
          }
          this.form.sets.push(chartSet)
        }
      } else {
        this.form.new = true
        this.form.name = ''
        this.form.start = ''
        this.form.end = ''
        this.form.intUnit = 1
        this.form.graphType = 1
        this.form.sets = [
          {
            name: '',
            building: '',
            meter: '',
            point: ''
          }
        ]
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
    },

    buttonVariant: function (index) {
      if (index === this.currentIndex) {
        return 'primary'
      } else {
        return 'info'
      }
    },

    changeIndex: function (index) {
      this.currentIndex = index
    },

    addGroup: function () {
      this.form.sets.push({
        name: '',
        building: '',
        meter: '',
        point: ''
      })
    },
    // change measurement selection and update card name based on meter type
    meterChange: function (index) {
      this.form.sets[index].point = this.meterPoints[0].value
      let energyType = this.$store.getters[this.form.sets[index].meter + '/meters'][0].type
      this.form.name = energyType
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler: async function (to, from) {
        this.form.tempMultStart = []
        this.form.tempMultEnd = []
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
.addFeatured {
  background-color: $--color-black;
  height: calc(400px + 0.8em);
  color: $--color-primary;
  margin-top: 0.1em;
  margin-bottom: 0.1em;
  border-radius: 5px;
  text-align: center;
  font-size: 10em;
  cursor: pointer;
}
.addFeatured .fas {
  margin-top: 1em;
}
.addFeatured:hover {
  border: solid 1px $--color-primary;
  outline: solid 3px $--color-primary;
  outline-offset: -4px;
}
.addFeatured:hover .fas {
  color: $--color-white;
}
.hiddenAddChart {
  display: none;
  font-size: 0.2em;
}
.addFeatured:hover .hiddenAddChart {
  display: block;
}
.addFeatured:hover {
  color: #c72f09;
}
.addFeatured:active {
  color: #d76740;
}
.setlabel {
  vertical-align: middle;
  float: left;
  font-size: 16px;
  color: #606266;
  line-height: 40px;
  padding: 0 12px 0 0;
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
  font-weight: 400;
}
.pad-bottom {
  padding: 1em;
}
.top {
  text-align: center;
}
.savedTimesP {
  display: block;
  font-size: 16px;
  font-weight: bold;
  margin-left: 10px;
  margin-bottom: -5px;
  margin-top: 10px;
}
.savedTimesDiv {
  text-align: left;
}
.savedTimesButton {
  display: inline-block;
  line-height: 1;
  white-space: nowrap;
  background-color: #1a1a1a;
  border: 1px solid #dcdfe6;
  border-color: #dcdfe6;
  color: #fff;
  text-align: center;
  box-sizing: border-box;
  outline: none;
  margin-left: 10px;
  margin-top: 10px;
  transition: 0.1s;
  font-weight: 700;
  padding: 12px 20px;
  font-size: 16px;
  border-radius: 4px;
}
.savedTimesButton:hover {
  background-color: #46484a;
}
.deleteTimeButton {
  scale: 1.5;
  margin-right: -5px;
  margin-left: 8px;
}
.deleteTimeButton:hover {
  color: #d73f09;
  cursor: pointer;
}
</style>
