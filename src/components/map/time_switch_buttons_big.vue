<!--
  Filename: time_switch_buttons_big.vue
  Description: vue component for map-building-pop-up showing the graph options
-->
<template>
  <el-row class="buttons">
    <el-col :span="8" class="rangeButtonParent" v-bind:class="{ active: currentRange == 0 }">
      <el-button class="rangeButton" @click="currentRange = 0">{{ campaign ? 'Past 6 Hours' : 'Week' }}</el-button>
    </el-col>
    <el-col :span="8" class="rangeButtonParent" v-bind:class="{ active: currentRange == 1 || currentRange == 3 }">
      <!--Change default interval for Solar Panels-->
      <el-button class="rangeButton" @click="currentRange = 1">{{ campaign ? 'Past Day' : '60 Days' }}</el-button>
    </el-col>
    <el-col :span="8" class="rangeButtonParent" v-bind:class="{ active: currentRange == 2 }">
      <el-button class="rangeButton" @click="currentRange = 2">{{
        campaign ? 'Past ' + days + ' Days' : 'Year'
      }}</el-button>
    </el-col>
  </el-row>
</template>
<script>
export default {
  props: ['height', 'campaign', 'days', 'blocks', 'campaignDateEnd', 'campaignDateStart', 'forceUpdate'],
  data () {
    return {
      currentRange: -1
    }
  },
  mounted () {},
  computed: {},
  watch: {
    blocks: {
      immediate: true,
      handler: async function (value) {
        this.currentRange = -1
        if (this.campaign) {
          this.currentRange = 2
        } else {
          this.currentRange = 1
        }
      }
    },
    currentRange: {
      immediate: true,
      handler: async function (value) {
        if (value < 0) return
        let intervalUnit = 'minute'
        let dateInterval = 15
        let time = new Date().getTime()
        let dateEnd = time - (time % (900 * 1000))
        let startModifier = 7 * 24 * 60 * 60 * 1000
        if (!this.campaign) {
          if (value === 0) {
            intervalUnit = 'hour'
            dateInterval = 6
            startModifier = 7 * 24 * 60 * 60 * 1000
          } else if (value === 1) {
            // start 60 days ago
            startModifier = 60 * 24 * 60 * 60 * 1000
            if (this.blocks[0].name === 'Solar Panel') {
              intervalUnit = 'hour'
              dateInterval = 1
              // We push it back 1 day since solar data is day older than regular meter data
              dateEnd -= 24 * 60 * 60 * 1000
            } else {
              intervalUnit = 'day'
              dateInterval = 1
              startModifier = 60 * 24 * 60 * 60 * 1000
            }
          } else {
            intervalUnit = 'day'
            dateInterval = 15
            startModifier = 365 * 24 * 60 * 60 * 1000
          }
        } else {
          dateEnd = this.campaignDateEnd
          if (value === 0) {
            intervalUnit = 'minute'
            dateInterval = 15
            startModifier = 6 * 60 * 60 * 1000
          } else if (value === 1) {
            intervalUnit = 'hour'
            dateInterval = 2
            startModifier = 24 * 60 * 60 * 1000
          } else {
            intervalUnit = 'day'
            dateInterval = 1
          }
        }
        let dateStart = new Date(dateEnd).getTime() - startModifier
        if (this.campaign && value === 2) {
          dateStart = this.campaignDateStart
        }

        for (let block of this.blocks) {
          // if (!block.promise) continue
          await block.promise
          this.$store.commit(block.path + '/dateInterval', dateInterval)
          this.$store.commit(block.path + '/intervalUnit', intervalUnit)
          this.$store.commit(block.path + '/dateStart', dateStart)
          this.$store.commit(block.path + '/dateEnd', dateEnd)

          /* Forces the campaign accumulated real stats to update
             Probably a better way to do this but for now it will
             work
          */
          /*
            10/24/2021:
            Ok -- so the issue with the below line is that it's triggering
            excessive API calls on a user session when opening a single
            building on the map interface, but from the above
            comment it also sounds like it's needed for the campaigns.

            So, I'm adding a prop-flag to toggle it... for now!
              - Milan
          */
          if (this.forceUpdate) {
            this.$store.dispatch(block.path + '/getData')
          }
        }
      }
    }
  },
  methods: {
    dateOffset: function () {
      let dateS = new Date(this.story.date_end)
      let dateN = new Date()
      let d = dateN
      if (this.campaign && dateN > dateS) {
        d = dateS
      }
      if (this.currentRange === 0) {
        this.campaign ? d.setHours(d.getHours() - 6) : d.setDate(d.getDate() - 7)
      } else if (this.currentRange === 1) {
        this.campaign ? d.setDate(d.getDate() - 1) : d.setDate(d.getDate() - 60)
      } else if (this.currentRange === 2) {
        this.campaign ? (d = new Date(this.story.date_start)) : d.setFullYear(d.getFullYear() - 1)
      }
      return d.toISOString()
    }
  }
}
</script>
<style scoped lang="scss">
.buttons {
  left: 19.5px;
  height: 80px !important;
}
$buttonHeight: 40px;
$parentPadding: 2px;
$activeheight: 45px;
$activePadding: 2.5px;
$clipInset: 10px;

.rangeButtonParent {
  position: relative;
  padding: $parentPadding;
  background-color: color.adjust($color-white, $lightness: -30%);
  clip-path: polygon(
    #{calc($clipInset / $buttonHeight) * ($buttonHeight + 2 * $parentPadding)} 0%,
    0% 100%,
    calc(100% - #{calc($clipInset / $buttonHeight) * ($buttonHeight + 2 * $parentPadding)}) 100%,
    100% 0%
  );
  margin: 0 !important;
}
.rangeButtonParent:not(.active) {
  top: calc((($activePadding + $activeheight) - ($buttonHeight + $parentPadding)) / 2);
  height: $buttonHeight + 4px;
}
.rangeButtonParent:nth-child(1) {
  border-radius: 5px 0px 0px 5px;
  clip-path: polygon(
    0% 0%,
    0% 100%,
    calc(100% - #{calc($clipInset / $buttonHeight) * ($buttonHeight + 2 * $parentPadding)}) 100%,
    100% 0%
  );
}
.rangeButtonParent:nth-child(2) {
  left: -13px;
}
.rangeButtonParent:nth-child(3) {
  left: -26px;
  border-radius: 0px 5px 5px 0px;
  clip-path: polygon(
    #{calc($clipInset / $buttonHeight) * ($buttonHeight + 2 * $parentPadding)} 0%,
    0% 100%,
    100% 100%,
    100% 0%
  );
}
.rangeButton {
  border-radius: 0px;
  clip-path: polygon(#{$clipInset} 0%, 0% 100%, calc(100% - #{$clipInset}) 100%, 100% 0%);
  background-color: $color-black;
  color: color.adjust($color-white, $lightness: -30%);
  border: 0px !important;
  width: 100%;
  height: $buttonHeight;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rangeButtonParent:nth-child(1) .rangeButton {
  border-radius: 5px 0px 0px 5px;
  clip-path: polygon(0% 0%, 0% 100%, calc(100% - #{$clipInset}) 100%, 100% 0%);
}
.rangeButtonParent:nth-child(3) .rangeButton {
  border-radius: 0px 5px 5px 0px;
  clip-path: polygon(#{$clipInset} 0%, 0% 100%, 100% 100%, 100% 0%);
}
.rangeButtonParent:not(.active):hover .rangeButton {
  z-index: 3;
  background-color: $color-black; //color.adjust($color-primary, $lightness: -10%);
  color: $color-white;
  border: 0px;
}

.rangeButtonParent:not(.active):hover {
  z-index: 2;
  background-color: $color-white; //color.adjust($color-primary, $lightness: -10%);
}

.rangeButtonParent.active {
  clip-path: polygon(
    #{calc($clipInset / $buttonHeight) * ($activeheight + 2 * $activePadding)} 0%,
    0% 100%,
    calc(100% - #{calc($clipInset / $buttonHeight) * ($activeheight + 2 * $activePadding)}) 100%,
    100% 0%
  );
  padding: $activePadding;
  background-color: $color-white;
  z-index: 2;
  height: $activeheight + 4px;
}

.rangeButtonParent:nth-child(1).active {
  clip-path: polygon(
    0% 0%,
    0% 100%,
    calc(100% - #{calc($clipInset / $buttonHeight) * ($activeheight + 2 * $activePadding)}) 100%,
    100% 0%
  );
}
.rangeButtonParent:nth-child(3).active {
  clip-path: polygon(
    #{calc($clipInset / $buttonHeight) * ($activeheight + 2 * $activePadding)} 0%,
    0% 100%,
    100% 100%,
    100% 0%
  );
}
.rangeButtonParent.active .rangeButton {
  clip-path: polygon(
    #{calc($clipInset / $buttonHeight) * $activeheight} 0%,
    0% 100%,
    calc(100% - #{calc($clipInset / $buttonHeight) * $activeheight}) 100%,
    100% 0%
  );
}
.rangeButtonParent:nth-child(1).active .rangeButton {
  clip-path: polygon(0% 0%, 0% 100%, calc(100% - #{calc($clipInset / $buttonHeight) * $activeheight}) 100%, 100% 0%);
}
.rangeButtonParent:nth-child(3).active .rangeButton {
  clip-path: polygon(#{calc($clipInset / $buttonHeight) * $activeheight} 0%, 0% 100%, 100% 100%, 100% 0%);
}
.rangeButtonParent.active .rangeButton {
  background-color: $color-primary;
  color: $color-white;
  height: $activeheight;
}
.rangeButtonParent.active .rangeButton:hover {
  background-color: $color-primary;
  color: $color-white;
  border: 0px;
}
</style>
