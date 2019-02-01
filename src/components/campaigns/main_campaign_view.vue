<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-24T13:56:21-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-31T22:41:55-08:00
-->
<template>
  <el-row class='campaignView'>
    <el-row class='herorow'>
      <el-col :span='24'>
        <heropicture :media='story.media' :description='story.description' :name='story.name' />
      </el-col>
    </el-row>
    <el-row class='controlRow'>
      <el-col :span='8' class='buildingContainer'>
        <buildingList :loaded='loaded' :buildings='buildings' @clickedBuilding='changeChartIndex'/>
      </el-coL>
      <el-col :span='16' class='otherSide'>
        <div class='chartArea'>
          <el-row class='title'>
            <el-col :span='12'>
              {{ currentTitle }}
            </el-col>
            <el-col :span='12' class='timeSwitchButtons'>
              <switchButtons @update='updateAccumulated()' :campaign='true' />
            </el-col>
          </el-row>
          <chartController :randomColors='1' :graphType='graphType' :index='currentIndex' ref="chartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': '100%','height': '332px', 'padding-right': '0.5em','padding-left': '0.5em','padding-top': '1em' }" :height='332'/>
        </div>
      </el-col>
    </el-row>
    <el-row>
      <reductionTips />
    </el-row>
  </el-row>
</template>

<script>
import heropicture from '@/components/account/heropicture.vue'
import { mapGetters } from 'vuex'
import chartController from '@/components/charts/chartController'
import buildingList from '@/components/campaigns/campaign_building_list'
import reductionTips from '@/components/campaigns/campaign_reduction_tips'
import switchButtons from '@/components/map/time_switch_buttons_big'

export default {
  components: {
    heropicture,
    chartController,
    buildingList,
    reductionTips,
    switchButtons
  },
  data () {
    return {
      buildings: [],
      loaded: false,
      currentTitle: 'Energy Saved',
      graphType: 1,
      currentIndex: 0
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block',
      'user'
    ])
  },
  mounted () {
    this.$store.dispatch('campaign', this.$route.params.id).then(() => {
      for (let index in this.story.blocks) {
        if (index > 0) {
          this.buildings.push(this.story.blocks[index])
        }
      }

      this.$nextTick(() => {
        this.updateAccumulated()
        this.loaded = true
      })
    })
  },
  methods: {
    updateAccumulated: function () {
      this.$refs.chartController.parse()
      const compareDate = new Date(this.story.blocks[0].date_start).getTime()
      for (let chart of this.story.blocks[0].charts) {
        let index = chart.data.length - 1
        console.log(chart)
        let accm = 0
        while (new Date(chart.data[index].x).getTime() >= compareDate) {
          accm += chart.data[index].y
          index--
        }
        accm /= chart.data.length - index
        this.$store.commit('updateBlockAverage', { index: this.story.blocks[0].charts.indexOf(chart), avg: accm })
      }
      this.buildings.sort((a, b) => {
        return a.accumulatedPercentage - b.accumulatedPercentage
      })
    },
    changeChartIndex: function (index) {
      if (this.currentIndex !== index) {
        this.currentTitle = this.block(index).name
        this.currentIndex = index
        this.graphType = 5
      } else {
        this.currentTitle = 'Energy Saved'
        this.currentIndex = 0

        this.graphType = 1
      }
      this.$nextTick(() => {
        this.$refs.chartController.parse()
      })
    }
  }
}
</script>

<style scoped lang='scss'>
.title {
  font-size: 34px;
  color: $--color-white;
  font-family: "StratumNo2";
  text-align: left;
  padding-bottom: 1em;
}
.controlRow {
  background-color: $--color-black;
  box-shadow: 0px 2px 4px -2px rgba(0,0,0,0.5);
}
.herorow {
  border-bottom: solid 1px white;
}
.otherSide {
  padding: 2em;
  padding-left: 1em;
  padding-bottom: 1em;
}
.chartArea {
  padding: 2em;
  background-color: $--color-black;
  border-radius: 5px;
}
.buildingContainer {
  padding: 2em;
  padding-right: 1em;
  padding-bottom: 1em;
  // min-height: calc(100vh - #{$--nav-height} - 200px);
  height: calc(400px + 5em);
}
.timeSwitchButtons {
  text-align: right;
  height: 34px;
  position: relative;
  top: -0.5em;
  font-size: 12px !important;
}
</style>
