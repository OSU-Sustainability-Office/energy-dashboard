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

      <!-- Charts and the building selection list -->
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
                <switchButtons :blocks='blocks' :campaign='true' :days='days' />
              </el-col>
            </el-row>
            <chartController :path='blockPath' :randomColors='1' class="chart" :styleC="{ 'display': 'inline-block', 'width': '98%','height': '332px', 'padding-right': '0.5em','padding-left': '0.5em','padding-top': '1em' }" :height='332'/>
          </div>
        </el-col>
      </el-row>

      <!-- Reduction tips at the bottom of the page -->
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
      blocks: [],
      loaded: false, // Toggles the spinning circle loading animation on the graph and building list
      currentTitle: 'Energy Saved',
      blockPath: '', // This is the path to the block currently diplayed on the main graph
      media: '', // URL of the photo along the top bar
      name: '', // Displays the name of the competition above the graph
      description: '',
      startDate: null, // Start and End dates for the competition
      endDate: null, // Formatted like this: "2020-02-02T15:00:00.000Z"
      days: 0 // The number of days that have elapsed during the competition
    }
  },
  mounted () {
    // Download the campaigns
    // If they have already been downloaded, the VueX store won't make extaneous API calls
    this.$store.dispatch('campaigns/getCampaigns').then(campaigns => {
      campaigns.forEach(campaign => {
        if (campaign.id === parseInt(this.$route.params.id)) {
          this.$store.dispatch('campaigns/getCampaign', campaign.id).then(camp => {
            this.setCampaign(camp)
          })
        }
      })
    })
  },
  methods: {
    // Retrieves campaign information from the vuex store
    setCampaign: async function(camp) {
      // Set the heropicture logo url
      this.media = camp.media

      // Set the campaign name
      this.name = camp.name

      // Set the number of days that have elapsed since the campaign started
      // The number of days is displayed on the frontend
      this.startDate = new Date(camp.date_start).getTime()
      this.endDate = new Date(camp.date_end).getTime()
      const nowDate = new Date().getTime()
      // If the competition ended, set the number of days to the difference between the start and end dates
      // Otherwise, calculate the difference between the current date and the start date
      this.days = this.endDate < nowDate ? Math.round((this.endDate - this.startDate) / 86400000) + 1 : Math.round((nowDate - this.startDate) / 86400000) + 1

      // Retrieve the buildings from the campaign
      camp.buildings.forEach(async b => {
        await Promise.all(this.$store.state['campaigns']['campaign_' + camp.id]['promises'])
        const bdg = this.$store.state['map']['building_' + b.toString()]
        this.buildings.push({
          id: b,
          accumulatedPercentage: 0,
          name: bdg.name
        })
      })

      // Save references to this campaign's blocks locally
      await Promise.all(this.$store.state['campaigns']['campaign_' + camp.id]['blockPromises'])
      this.blocks = camp.blocks
      this.blockPath = camp.blocks[0].path

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
      const endDate = new Date(this.dateStart).getTime()
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
      console.log(index)
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
