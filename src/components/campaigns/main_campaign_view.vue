<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-24T13:56:21-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-04-09T11:33:36-07:00
-->
<template>
  <el-row class='stage'>
    <el-col :span='24' class='main'>
      <!-- Large logo at the top of the page -->
      <el-row class='herorow'>
        <el-col :span='24'>
          <heropicture :media='media' :description='description' :name='name' />
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
                <switchButtons @update='updateAccumulated()' :campaign='true' :days='days' />
              </el-col>
            </el-row>
            <chartController :randomColors='1' :graphType='graphType' :index='currentIndex' ref="chartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': '98%','height': '332px', 'padding-right': '0.5em','padding-left': '0.5em','padding-top': '1em' }" :height='332'/>
          </div>
        </el-col>
      </el-row>
      <el-row>
        <reductionTips />
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import heropicture from '@/components/extras/heropicture.vue'
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
      buildings: [], // Lists the buildings involved with this competition
      loaded: false,
      currentTitle: 'Energy Saved',
      graphType: 1,
      currentIndex: 0,
      media: '',
      name: '',
      description: '',
      startDate: null,
      endDate: null,
      days: 0 // The number of days that have elapsed during the competition
    }
  },
  computed: {
    // ...mapGetters([ // Retrieve these getters from the vuex store, and map computed values to the vuex store values
    //   'story',
    //   'block',
    //   'user'
    // ])
  },
  mounted () {
    // Download the campaigns
    // If they have already been downloaded, the VueX store won't make extaneous API calls
    this.$store.dispatch('campaigns/getCampaigns').then(r => {
      r.forEach(campID => {
        if (campID === parseInt(this.$route.params.id)) this.setCampaign(this.$store.state['campaigns']['campaign_' + campID])
      })
    })
  },
  methods: {
    // Retrieves campaign information from the vuex store
    setCampaign: function(camp) {
      // Set the number of days that have elapsed since the campaign started
      // The number of days is displayed on the frontend
      this.startDate = new Date(camp.date_start).getTime()
      this.endDate = new Date(camp.date_end).getTime()
      const nowDate = new Date().getTime()
      // If the competition ended, set the number of days to the difference between the start and end dates
      // Otherwise, calculate the difference between the current date and the start date
      this.days = endDate < nowDate ? Math.round((endDate - this.startDate) / 86400000) + 1 : Math.round((nowDate - this.startDate) / 86400000) + 1

      // Retrieve the buildings from the campaign
      camp.buildings.forEach(b => {
        this.buildings.push(b)
      })

      // Set the heropicture logo url
      this.media = camp.media

      // Set the campaign name
      this.name = camp.name

      // Retrieve the data for each building

      // this.$nextTick(() => {
      //   this.updateAccumulated()
      //   for (let i in this.buildings) {
      //     // JS thought i should be a string and would concat it with 1...
      //     this.buildings[i].place = (parseInt(i) + 1).toString()
      //   }
      //   this.loaded = true
      // })
    },

    // Retrieve data from VueX
    updateAccumulated: function () {
      const endDate = new Date(this.date_start).getTime()
      for (let chart of this.story.blocks[0].charts) {
        let index = chart.data.length - 1
        if (index < 0) {
          continue
        }
        let accm = 0
        while (new Date(chart.data[index].x).getTime() >= endDate) {
          accm += chart.data[index].y
          index--
        }
        accm /= chart.data.length - index
        this.$store.commit('updateBlockAverage', { index: (this.story.blocks[0].charts.indexOf(chart) + 1), avg: accm })
      }
      this.buildings.sort((a, b) => {
        return a.accumulatedPercentage - b.accumulatedPercentage
      })
      this.$nextTick(() => {
        this.$refs.chartController.parse()
      })
    },

    // Change which chart is displayed when a chart selection button is pressed
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
<style lang='scss'>
.buildingContainer ::-webkit-scrollbar {
  width: 10px;
  border-radius: 10px !important;
}

/* Track */
.buildingContainer ::-webkit-scrollbar-track {
  background: #00000088;
}

/* Handle */
.buildingContainer ::-webkit-scrollbar-thumb {
  background: $--color-primary;
  border-radius: 10px;
}

/* Handle on hover */
.buildingContainer ::-webkit-scrollbar-thumb:hover {
  background: darken($--color-primary, 10%);
}
</style>
<style scoped lang='scss'>
.stage {
  position: absolute;
  top: 0;
  left: 0;
  height: calc(100vh - #{$--nav-height});
  width: 100%;
  margin: 0;
  padding: 0;
}
.main {
  padding: 0;
}
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
