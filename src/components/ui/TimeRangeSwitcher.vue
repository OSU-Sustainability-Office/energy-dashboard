<!--
  Filename: TimeRangeSwitcher.vue
  Description: UI component that allows users to switch between time ranges (e.g., past day, week, or year)
  for the data displayed in a chart.
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
// constants
const DAY_IN_MS = 24 * 60 * 60 * 1000; // 1 day in ms
const HOUR_IN_MS = 60 * 60 * 1000; // 1 hour in ms
const FIFTEEN_MIN_IN_MS = 15 * 60 * 1000; // 15 minutes in ms
const floorTo = (t, ms) => t - (t % ms);

// per-mode presets for each range button
const TIME_RANGE_PRESETS = {
  noCampaign: {
    0: { unit: 'hour', interval: 6, startMs: 7 * DAY_IN_MS }, // past week
    1: { unit: 'day', interval: 1, startMs: 60 * DAY_IN_MS }, // past 60 days
    2: { unit: 'day', interval: 15, startMs: 365 * DAY_IN_MS }, // past year
  },
  campaign: {
    0: { unit: 'minute', interval: 15, startMs: 6 * HOUR_IN_MS }, // past 6 hours
    1: { unit: 'hour', interval: 2, startMs: DAY_IN_MS }, // past day
    2: { unit: 'day', interval: 1, startMs: null }, // special case: full campaign date range
  },
};
export default {
  props: ['height', 'campaign', 'days', 'blocks', 'campaignDateEnd', 'campaignDateStart', 'forceUpdate'],
  data() {
    return {
      currentRange: -1
    }
  },
  mounted() {},
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
        const mode = this.campaign ? 'campaign' : 'noCampaign';
        const preset = TIME_RANGE_PRESETS[mode][value];

        const dateEnd = this.campaign ? this.campaignDateEnd : floorTo(Date.now(), FIFTEEN_MIN_IN_MS);
        const intervalUnit = preset.unit;
        const dateInterval = preset.interval;
        const dateStart = (this.campaign && value === 2)
          ? this.campaignDateStart // full campaign range
          : dateEnd - preset.startMs; // adjusted start time

        for (let block of this.blocks) {
          // if (!block.promise) continue
          await block.promise
          this.$store.commit(block.path + '/dateInterval', dateInterval)
          this.$store.commit(block.path + '/intervalUnit', intervalUnit)
          this.$store.commit(block.path + '/dateStart', dateStart)
          this.$store.commit(block.path + '/dateEnd', dateEnd)
          if (this.forceUpdate) {
            // used to trigger a refresh for the campaign leaderboard
            this.$store.dispatch(block.path + '/getData')
          }
        }
      }
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
