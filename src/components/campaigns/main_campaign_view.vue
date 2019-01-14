<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-24T13:56:21-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-11T11:44:09-08:00
-->
<template>
  <el-row class='campaignView'>
    <el-row class='herorow'>
      <el-col :span='24'>
        <heropicture :media='story.media' :description='story.description' :name='story.name' />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span='8' class='buildingContainer'>
        <buildingList :buildings='buildings' @clickedBuilding='changeChartIndex'/>
      </el-coL>
      <el-col :span='16' class='otherSide'>
        <div class='chartArea'>
          <chartController :randomColors='1' :graphType='1' :index='0' ref="chartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': '100%','height': '400px', 'padding-right': '0.5em','padding-left': '0.5em','padding-top': '1em' }" :height='400' v-if='loaded'/>
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

export default {
  components: {
    heropicture,
    chartController,
    buildingList,
    reductionTips
  },
  data () {
    return {
      buildings: [],
      loaded: false
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
      this.loaded = true
      for (let index in this.story.blocks) {
        if (index > 0) {
          this.buildings.push(this.story.blocks[index])
        }
      }
      this.buildings.sort((a, b) => {
        return a.accumulatedPercentage - b.accumulatedPercentage
      })
      this.$nextTick(() => {
        this.$refs.chartController.parse()
        // for (let controller of this.$refs.buildingChartController) {
        //   controller.parse()
        // }
      })
    })
  },
  methods: {
    changeChartIndex: function (index) {
      if (this.$refs.chartController.index !== index) {
        this.$refs.chartController.index = index
        this.$refs.chartController.graphType = 5
      } else {
        this.$refs.chartController.index = 0
        this.$refs.chartController.graphType = 1
      }
      this.$refs.chartController.parse()
    }
  }
}
</script>

<style scoped lang='scss'>
.herorow {
  box-shadow: 0px 2px 4px -2px rgba(0,0,0,0.5);
}
.otherSide {
  padding: 2em;
}
.chartArea {
  padding: 2em;
  background-color: $--color-black;
  border-radius: 5px;
}
.buildingContainer {
  padding: 2em;
  // min-height: calc(100vh - #{$--nav-height} - 200px);
  height: calc(400px + 5em);
}
.hexagonContainer {
  background-image: url('~/images/hexagon.png');
  background-color: rgba(255,255,255, 0.3);
  padding-top: 3em;
  background-size: 100px 100px;
  min-height: calc(100vh - #{$--nav-height} - 200px);
  width: 100%;
}
</style>
