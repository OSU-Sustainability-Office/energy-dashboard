<!--
  Filename: card.vue
  Info: Displays a single chart for a dataset from the "buildings" directory.
-->
<template>
  <div
    class="card-iframe"
    ref="card"
    v-if="
      this.path === 'map/building_35/block_175' ||
      this.path === 'map/building_36/block_176' ||
      this.path === 'map/building_37/block_177' ||
      this.path === 'map/building_38/block_178' ||
      this.path === 'map/building_85/block_264'
    "
  >
    <el-row :span="24" class="title" ref="title">
      <el-col :span="20">{{ name }}</el-col>
    </el-row>

    <!--Chart Below-->
    <el-row style="overflow: hidden" :span="24">
      <el-col :span="24">
        <!--If you change the "height" attribute here, remember to also change the chart-height variable in the scss-->
        <chartController
          :randomColors="1"
          :path="path"
          ref="chartController"
          class="chart"
          :styleC="style"
          :height="550"
        />
      </el-col>
    </el-row>
    <p v-if="this.path === 'map/building_35/block_175'">
      <a
        href="https://mysolarcity.com/Share/007c9349-72ba-450c-aa1f-4e5a77b68f79#/monitoring/historical/month"
        target="_blank"
        >Data Provided by Tesla</a
      >
    </p>
    <p v-if="this.path === 'map/building_36/block_176'">
      <a
        href="https://mysolarcity.com/share/9D5EB0D2-E376-44A1-9B8C-8DFCDD7507A5#/monitoring/historical/month"
        target="_blank"
        >Data Provided by Tesla</a
      >
    </p>
    <p v-if="this.path === 'map/building_37/block_177'">
      <a
        href="https://mysolarcity.com/Share/38954c21-8669-47b6-8376-835cc24f908c#/monitoring/historical/month"
        target="_blank"
        >Data Provided by Tesla</a
      >
    </p>
    <p v-if="this.path === 'map/building_38/block_178'">
      <a
        href="https://mysolarcity.com/Share/47cf089a-5b93-4200-8566-e030cb4f8574#/monitoring/historical/month"
        target="_blank"
        >Data Provided by Tesla</a
      >
    </p>
    <p v-if="this.path === 'map/building_85/block_264'">
      <a
        href="https://mysolarcity.com/share/BB1ABBE8-1FB9-4C17-BB0A-A1DE9339DB1C#/monitoring/historical/month"
        target="_blank"
        >Data Provided by Tesla</a
      >
    </p>
    <p>
      <a href="https://sustainability.oregonstate.edu/ground-mounted-photovoltaic-arrays" target="_blank"
        >More Info About OSU's Partnership with Tesla</a
      >
    </p>
  </div>
  <div class="card" ref="card" v-else>
    <el-row :span="24" class="title" ref="title">
      <el-col :span="20">{{ name }}</el-col>
      <el-col :span="4" v-if="personalView || publicView" class="right"
        >&nbsp;<i class="fas fa-sliders-h" @click="openModal()"></i
      ></el-col>
    </el-row>

    <!--Next/Previous Buttons-->
    <el-row :span="24">
      <el-col :span="12" class="buttonDisplay">
        <el-button
          size="small"
          type="primary"
          class="moveButtons"
          @click="previousInterval"
          icon="el-icon-d-arrow-left"
        >
          Previous
        </el-button>
      </el-col>
      <el-col :span="12">
        <el-row type="flex" justify="end">
          <el-button size="small" type="primary" class="moveButtons" @click="nextInterval" :disabled="!nextExists">
            Next <i class="el-icon-d-arrow-right"></i>
          </el-button>
        </el-row>
      </el-col>
    </el-row>
    <!--Chart Below-->
    <el-row style="overflow: hidden" :span="24">
      <el-col :span="24">
        <!--If you change the "height" attribute here, remember to also change the chart-height variable in the scss-->
        <chartController
          :randomColors="1"
          :path="path"
          ref="chartController"
          class="chart"
          :styleC="style"
          :height="430"
        />
      </el-col>
    </el-row>
  </div>
</template>

<script>
import chartController from '@/components/charts/chartController.vue'

export default {
  name: 'card',
  props: ['path'],
  components: {
    chartController
  },
  data () {
    return {
      editcard: false,
      tempName: '',
      interval: 15,
      interval_unit: 'minute',
      date_start: '',
      date_end: '',
      graphtype: 1,
      style: {
        display: 'inline-block',
        width: 'calc(100% - 3em)',
        height: '400px',
        'margin-right': '0.5em',
        'margin-left': '0.5em',
        'padding-right': '1em',
        'padding-left': '1em',
        'padding-top': '1em'
      }
    }
  },
  computed: {
    name: {
      get () {
        let name = this.$store.getters[this.path + '/name']
        // console.log(this.path)
        if (name && name !== '') {
          return name
        } else {
          return '\xa0'
        }
      }
    },
    personalView: {
      get () {
        return this.path.includes('user')
      }
    },
    publicView: {
      get () {
        return this.path.includes('building')
      }
    },
    intunit: {
      // 1 15 Minutes
      // 2 1 hour
      // 3 1 Day
      // 4 1 week
      // 5 1 month
      get: function () {
        if (this.interval === 15 && this.interval_unit === 'minute') {
          return 1
        } else if (this.interval === 1 && this.interval_unit === 'hour') {
          return 2
        } else if (this.interval === 1 && this.interval_unit === 'day') {
          return 3
        } else if (this.interval === 7 && this.interval_unit === 'day') {
          return 4
        } else if (this.interval === 1 && this.interval_unit === 'month') {
          return 5
        } else {
          return 1
        }
      },
      set: function (v) {
        switch (v) {
          case 1:
            this.interval = 15
            this.interval_unit = 'minute'
            break
          case 2:
            this.interval = 1
            this.interval_unit = 'hour'
            break
          case 3:
            this.interval = 1
            this.interval_unit = 'day'
            break
          case 4:
            this.interval = 7
            this.interval_unit = 'day'
            break
          case 5:
            this.interval = 1
            this.interval_unit = 'month'
            break
        }
      }
    },
    // returns the current time interval from an end date to start date
    currentTimeInterval: function () {
      return this.$store.getters[this.path + '/dateEnd'] - this.$store.getters[this.path + '/dateStart']
    },
    // returns boolean for if next interval exists in program.
    nextExists: function () {
      return this.nextEndpoint < Date.now()
    },
    // returns boolean for if prev interval exists in program
    prevExists: function () {
      // Check if user is asking for data in the past,
      // since the earliest record in energy_data right now is from 2018
      // this is the hard-coded in time-stamp and may be subject to change
      // depending on how far back our records go.
      return this.nextStartpoint > 1527836400000
    },
    // holds next possible interval start
    nextStartpoint: function () {
      return this.$store.getters[this.path + '/dateStart'] - this.currentTimeInterval
    },
    // holds next possible interval end
    nextEndpoint: function () {
      return this.$store.getters[this.path + '/dateEnd'] + this.currentTimeInterval
    }
  },
  methods: {
    openModal: function () {
      this.$store.dispatch('modalController/openModal', {
        name: 'edit_card',
        path: this.path
      })
    },
    cardSave: async function () {
      // this.editcard = false
      // let charts = await this.$refs.featureController.saveCharts()
      // let block = {
      //   name: this.tempName,
      //   index: this.index,
      //   date_interval: this.interval,
      //   interval_unit: this.interval_unit,
      //   date_start: this.date_start,
      //   date_end: this.date_end,
      //   graph_type: this.graphtype,
      //   charts: charts
      // }
      // this.$store.dispatch('block', block).then(() => {
      //   this.$refs.chartController.parse()
      // })
    },
    // Moves chart data to its previously occuring interval
    previousInterval: function () {
      let currentStartPoint = this.$store.getters[this.path + '/dateStart']
      this.$store.commit(this.path + '/dateStart', this.nextStartpoint)
      this.$store.commit(this.path + '/dateEnd', currentStartPoint)
    },
    // Moves chart data to its next occuring interval
    nextInterval: function () {
      let currentEndPoint = this.$store.getters[this.path + '/dateEnd']
      this.$store.commit(this.path + '/dateEnd', this.nextEndpoint)
      this.$store.commit(this.path + '/dateStart', currentEndPoint)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
$chart-height: 430px;

.card {
  background-color: $color-white;
  padding: 2em;
  padding-bottom: 5em;
  height: calc(400px + 8em);
  color: $color-primary;
  margin-top: 1em;
  margin-bottom: 1em;
  border-radius: 5px;
  box-shadow: 0px 0px 3px $color-black;
}

.card-iframe {
  background-color: $color-white;
  padding: 2em;
  padding-bottom: 5em;
  height: calc(520px + 8em);
  color: $color-primary;
  margin-top: 1em;
  margin-bottom: 1em;
  border-radius: 5px;
  box-shadow: 0px 0px 3px $color-black;
}
.title {
  font-family: 'StratumNO2';
  font-size: 2em;
  padding-bottom: 0.35em;
}
.title .fas {
  transition: color 0.2s ease;
  cursor: pointer;
}
.title .fas:hover {
  color: $color-black;
}
.right {
  text-align: right;
}
.moveButtons {
  height: 3em;
  width: 10em;
}
</style>
