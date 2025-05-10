<!--
  Filename: main_campaign_view.vue
  Info: The main graphic page for a campaign.
-->
<template>
  <el-row class="stage">
    <el-col :span="24" class="main">
      <!-- Large logo at the top of the page -->
      <el-row class="herorow">
        <el-col :span="24">
          <HeroPicture :media="media" :description="description" :name="name" />
        </el-col>
      </el-row>

      <!-- Charts and the building selection list -->
      <el-row class="controlRow" v-if="loaded">
        <el-col :span="8" class="buildingContainer">
          <buildingList v-model="blockPath" :loaded="loaded" :path="campaignPath" />
        </el-col>
        <el-col :span="16" class="otherSide">
          <div class="chartArea">
            <el-row class="title">
              <el-col :span="30">
                {{ currentTitle }}
              </el-col>
            </el-row>
            <el-row class="timeframe-labels">
              <el-col :span="30" class="timeSwitchButtons">
                <TimeRangeSwitcher
                  :blocks="blocks"
                  :campaign="true"
                  :days="days"
                  :campaignDateStart="campaignStart"
                  :campaignDateEnd="campaignEnd"
                />
              </el-col>
            </el-row>
            <chartController
              :path="blockPath"
              :randomColors="1"
              class="chart"
              :styleC="{
                display: 'inline-block',
                width: '98%',
                height: '340px',
                'padding-right': '0.5em',
                'padding-left': '0.5em',
                'padding-top': '1em'
              }"
              :invertColors="true"
              :height="362"
            />
          </div>
        </el-col>
      </el-row>
      <!--Loading message-->
      <el-row v-else>
        <el-col :span="24">
          <el-alert title="Loading..." :closable="false" type="info">
            <!--TODO: add loading status message here-->
          </el-alert>
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
import HeroPicture from '@/components/ui/HeroPicture.vue'
import chartController from '@/components/charts/chartController.vue'
import buildingList from '@/components/campaigns/campaign_building_list.vue'
import reductionTips from '@/components/campaigns/campaign_reduction_tips.vue'
import TimeRangeSwitcher from '@/components/ui/TimeRangeSwitcher.vue'

export default {
  components: {
    HeroPicture,
    chartController,
    buildingList,
    reductionTips,
    TimeRangeSwitcher
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
        let current = new Date().getTime()

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
        let blocks = [...this.$store.getters[this.campaignPath + '/blocks']]
        blocks.push(this.$store.getters[this.campaignPath + '/defaultBlock'])
        return blocks
      }
    },
    campaignPath: {
      get () {
        if (!this.$store.getters['campaigns/campaign'](this.$route.params.id)) {
          return null
        }
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
  methods: {}
}
</script>
<style lang="scss">
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
  background: $color-primary;
  border-radius: 10px;
}

/* Handle on hover */
.buildingContainer ::-webkit-scrollbar-thumb:hover {
  background: color.adjust($color-primary, $lightness: -10%);
}
</style>
<style scoped lang="scss">
.stage {
  position: absolute;
  top: 0;
  left: 0;
  height: calc(100vh - #{$nav-height});
  width: 100%;
  margin: 0;
  padding: 0;
}
.main {
  padding: 0;
}
.title {
  font-size: 34px;
  color: $color-white;
  font-family: 'StratumNo2';
  text-align: left;
  padding-left: 1em;
  padding-bottom: 1em;
}
.timeframe-labels {
  font-size: 34px;
  color: $color-white;
  font-family: 'StratumNo2';
  text-align: left;
  padding-bottom: 1em;
}
.controlRow {
  background-color: $color-black;
  box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.5);
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
  background-color: $color-black;
  border-radius: 5px;
}
.buildingContainer {
  padding: 2em;
  padding-right: 1em;
  padding-bottom: 1em;
  // min-height: calc(100vh - #{$nav-height} - 200px);
  height: calc(450px + 5em);
}
.timeSwitchButtons {
  text-align: right;
  height: 34px;
  position: relative;
  top: -0.5em;
  font-size: 12px !important;
}

@media only screen and (max-width: 600px) {
  .buildingContainer {
    padding-right: 0em;
  }
  .otherSide {
    padding-left: 0em;
  }
  .title {
    padding-left: 2em;
  }
}
</style>
