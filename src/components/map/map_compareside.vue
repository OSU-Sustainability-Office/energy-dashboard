<template>
  <el-row class='stage'>
    <el-col :span='24' class='innerContent'>
      <el-row class='title'>
        <el-col :span='23'>
          {{oldName}} Vs {{newName}}
        </el-col>
        <el-col :span='1' class='close-box'><i class="fas fa-times" @click="$emit('hide')"></i></el-col>
      </el-row>
      <el-row class='pics'>
        <el-col :span='24'>
          <div class='rightSlopeUp' :style='`background-image: url("https://api.sustainability.oregonstate.edu/energy/images/${oldMedia}");`'></div><div class='leftSlopeDown' :style='`background-image: url("https://api.sustainability.oregonstate.edu/energy/images/${newMedia}");`'></div>
        </el-col>
      </el-row>
      <el-row class='buttons'>
        <el-col :span='8' class='rangeButtonParent'>
          <el-button class='rangeButton' @click='currentRange = 0' v-bind:class="{ active: currentRange == 0 }">Week</el-button>
        </el-col>
        <el-col :span='8' class='rangeButtonParent'>
          <el-button class='rangeButton' @click='currentRange = 1' v-bind:class="{ active: currentRange == 1 }">Month</el-button>
        </el-col>
        <el-col :span='8' class='rangeButtonParent'>
          <el-button class='rangeButton' @click='currentRange = 2' v-bind:class="{ active: currentRange == 2 }">Year</el-button>
        </el-col>
      </el-row>
      <el-row class='grid'>
        <el-col :span='16'>
          <chartController :randomColors='1' :graphType='1' :index='0' ref="lineChartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': 'calc(100% - 20px)','height': '100%', 'margin-right': '10px', 'margin-left': '10px' }" :height='400'/>
        </el-col>
        <el-col :span='8'>
          <chartController :randomColors='1' :graphType='3' :index='0' ref="pieChartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': 'calc(100% - 20px)','height': '100%', 'margin-right': '10px', 'margin-left': '10px' }" :height='400'/>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
import chartController from '@/components/charts/chartController'
import { mapGetters } from 'vuex'

export default {
  components: {
    chartController
  },
  props: ['compareStory', 'storyId'],
  data () {
    return {
      currentRange: 1,
      oldName: null,
      oldMedia: null,
      newMedia: null,
      newName: null
    }
  },
  watch: {
    currentRange: function (value) {
      value = parseInt(value)
      let i = 0
      let u = 0
      if (value === 0) {
        i = 6
        u = 'hour'
      } else if (value === 1) {
        i = 1
        u = 'day'
      } else if (value === 2) {
        i = 15
        u = 'day'
      }
      let promises = []
      for (let b of this.$store.getters.story.blocks) {
        let c = {
          index: b.index,
          date_interval: i,
          interval_unit: u,
          date_start: this.dateOffset()
        }

        promises.push(this.$store.dispatch('block', c))
      }
      Promise.all(promises).then(() => {
        this.$refs.pieChartController.parse()
        this.$refs.lineChartController.parse()
      }).catch(e => {
        console.log(e.message)
      })
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block'
    ])
  },
  mounted () {
    this.$nextTick(() => {
      this.$refs.pieChartController.colors = this.$refs.lineChartController.colors
    })
    this.$store.dispatch('story', this.storyId).then(async () => {
      this.oldName = this.story.name
      this.oldMedia = this.story.media
      let chartCopy = JSON.parse(JSON.stringify(this.story.blocks[0].charts[0]))
      await this.$store.dispatch('story', this.compareStory)
      this.newName = this.story.name
      this.newMedia = this.story.media
      await this.$store.dispatch('addChart', {
        index: 0,
        name: chartCopy.name,
        group: chartCopy.group_id,
        point: chartCopy.point,
        meter: chartCopy.meter,
        meters: chartCopy.meters
      })
      await this.$store.dispatch('block', { index: 0, date_start: this.dateOffset(), date_end: (new Date()).toISOString(), date_interval: 1, interval_unit: 'day' })

      this.$refs.lineChartController.parse()
      this.$refs.pieChartController.parse()
      Promise.resolve()
    })
  },
  methods: {
    dateOffset: function () {
      var d = new Date()
      if (this.currentRange === 0) {
        d.setDate(d.getDate() - 7)
      } else if (this.currentRange === 1) {
        d.setMonth(d.getMonth() - 1)
      } else if (this.currentRange === 2) {
        d.setYear(d.getYear() - 1)
      }
      return d.toISOString()
    }
  }
}
</script>
<style lang='scss' scoped>
@import '@/assets/style-variables.scss';

.stage {
  position: absolute;
  top: 0;
  left: 250px;
  width: calc(100% - 250px);
  z-index: 401;
  height: 100%;
  padding-left: 200px;
  padding-right: 20px;
  padding-top: 50px;
  padding-bottom: 50px;
}
.innerContent {
  position: relative;
  background-color: $--color-black;
  height: 100%;
  width: 100%;
}
.title {
  background-color: $--color-primary;
  height: 60px;
  color: $--color-white;
  border-bottom: solid 1px $--color-white;
  font-size: 26px;
  font-family: "StratumNo2";
  padding-top: 17px;
  padding-left: 20px;
  position: relative;
  top: 0;
  left: 0;
}
.close-box {
  cursor: pointer;
}
.pics > .el-col {
  position: relative;
  height: 220px;
  background-color: $--color-white;
}
.pics {
  border-bottom: solid 1px $--color-white;
}
$slope: 100px;
$border-width: 3px;
.rightSlopeUp {
  height: 100%;
  width: calc(50% + #{($slope / 2) - $border-width});
  position: absolute;
  top: 0;
  left: 0;
  display: inline-block;
  clip-path: polygon(0% 0%, 0% 100%, 100% 100%, calc(100% - #{$slope}) 0%);
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;

}
.leftSlopeDown {
  height: 100%;
  width: calc(50% + #{($slope / 2) - $border-width});
  position: absolute;
  left: calc(50% - #{($slope / 2) - ($border-width)});
  top: 0;
  display: inline-block;
  clip-path: polygon(0% 0%, $slope 100%, 100% 100%, 100% 0%);
  background-image: url("https://api.sustainability.oregonstate.edu/energy/images/April13OSU2429.jpg");
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
}
.buttons {
  padding: 1em;
}

.rangeButtonParent {
  padding: 0.2em;
}
.rangeButton {
  background-color: $--color-black;
  color: darken($--color-white, 30%);
  border-color: darken($--color-white, 30%);
  width: 100%;
}
.rangeButton:not(.active):hover {
  background-color: #000;//darken($--color-primary, 10%);
  color: $--color-white;
  border-color: $--color-white;
}
.rangeButton.active {
  background-color: $--color-primary;
  color: $--color-white;
  border-color: $--color-white;
}
.rangeButton.active:hover {
  background-color: $--color-primary;
  color: $--color-white;
  border-color: $--color-white;
}
.grid > .el-col {
  padding: 1em;
  padding-bottom: 3em;
}
</style>
