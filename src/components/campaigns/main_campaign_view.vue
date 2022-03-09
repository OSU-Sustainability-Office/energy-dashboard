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
          <buildingList v-model='blockPath' :loaded='loaded' :path='campaignPath'/>
        </el-coL>
        <el-col :span='16' class='otherSide'>
          <div class='chartArea'>
            <el-row class='title'>
              <el-col :span='12'>
                {{ currentTitle }}
              </el-col>
              <el-col :span='12' class='timeSwitchButtons'>
                <switchButtons :blocks='blocks' :campaign='true' :days='days' :campaignDateStart='campaignStart' :campaignDateEnd='campaignEnd' :forceUpdate="true" />
              </el-col>
            </el-row>
            <chartController :path='blockPath' :randomColors='1' class="chart" :styleC="{ 'display': 'inline-block', 'width': '98%','height': '340px', 'padding-right': '0.5em','padding-left': '0.5em','padding-top': '1em' }" :invertColors='true' :height='362'/>
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
      blockPath: '',
      loaded: false, // Toggles the spinning circle loading animation on the graph and building list
      currentTitle: 'Energy Saved',
      description: '',
      startDate: null, // Start and End dates for the competition
      endDate: null // Formatted like this: "2020-02-02T15:00:00.000Z"
    }
  },
  computed: {
    days: {
      get () {
        if (!this.campaignPath) return ''
        let start = this.campaignStart
        let end = this.campaignEnd

        return Math.floor((end - start) / (1000 * 60 * 60 * 24)) + 1
      }
    },
    campaignStart: {
      get () {
        if (!this.campaignPath) return ''
        return this.$store.getters[this.campaignPath + '/dateStart']
      }
    },
    campaignEnd: {
      get () {
        if (!this.campaignPath) return ''
        let end = this.$store.getters[this.campaignPath + '/dateEnd']
        let current =  (new Date()).getTime()

        if (current < end) {
          return current
        } else {
          return end
        }
      }
    },
    blocks: {
      get () {
        if (!this.campaignPath) return []
        // We need to copy this or adding the default block will change the return value of
        // the store
        let blocks = new Array(...this.$store.getters[this.campaignPath + '/blocks'])
        blocks.push(this.$store.getters[this.campaignPath + '/defaultBlock'])
        return blocks
      }
    },
    campaignPath: {
      get () {
        if (!this.$store.getters['campaigns/campaign'](this.$route.params.id)) return null
        return this.$store.getters['campaigns/campaign'](this.$route.params.id).path
      }
    },
    media: {
      get () {
        if (!this.campaignPath) return ''
        return this.$store.getters[this.campaignPath + '/media']
      }
    },
    name: {
      get () {
        if (!this.campaignPath) return ''
        return this.$store.getters[this.campaignPath + '/name']
      }
    }
  },
  async mounted () {
    this.loaded = false
    await this.$store.dispatch('campaigns/loadCampaigns')
    await this.$store.dispatch(this.campaignPath + '/buildBlocks')
    this.blockPath = this.campaignPath + '/block_default'
    this.loaded = true
  },
  methods: {
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
