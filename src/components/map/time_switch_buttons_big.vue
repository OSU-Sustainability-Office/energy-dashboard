<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-23T10:51:08-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-23T13:16:31-08:00
-->
<template>
  <el-row class='buttons'>
    <el-col class='rangeButtonParent' v-bind:class="{ active: currentRange == 0 }">
      <el-button class='rangeButton' @click='currentRange = 0'>Week</el-button>
    </el-col>
    <el-col class='rangeButtonParent' v-bind:class="{ active: currentRange == 1 }">
      <el-button class='rangeButton' @click='currentRange = 1'>Month</el-button>
    </el-col>
    <el-col class='rangeButtonParent' v-bind:class="{ active: currentRange == 2 }">
      <el-button class='rangeButton' @click='currentRange = 2'>Year</el-button>
    </el-col>
  </el-row>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  props: ['height'],
  data () {
    return {
      currentRange: 1
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block'
    ])
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
        this.$emit('update')
      }).catch(e => {
      })
    }
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
<style scoped lang='scss'>
.buttons {
  padding: 2em;
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
  width: 33.33%;
  padding: $parentPadding;
  background-color: darken($--color-white, 30%);
  clip-path: polygon(#{$clipInset/$buttonHeight * ($buttonHeight + 2*$parentPadding)} 0%, 0% 100%, calc(100% - #{$clipInset/$buttonHeight * ($buttonHeight + 2*$parentPadding)}) 100%, 100% 0%);
  margin: 0!important;
}
.rangeButtonParent:not(.active) {
  top: (($activePadding + $activeheight) - ($buttonHeight + $parentPadding))/2;
}
.rangeButtonParent:nth-child(1) {
  border-radius: 5px 0px 0px 5px;
  clip-path: polygon(0% 0%, 0% 100%, calc(100% - #{$clipInset/$buttonHeight * ($buttonHeight + 2*$parentPadding)}) 100%, 100% 0%);
}
.rangeButtonParent:nth-child(2) {
  left: -13px;
}
.rangeButtonParent:nth-child(3) {
  left: -26px;
  border-radius: 0px 5px 5px 0px;
  clip-path: polygon(#{$clipInset/$buttonHeight * ($buttonHeight + 2*$parentPadding)} 0%, 0% 100%, 100% 100%, 100% 0%);
}
.rangeButton {
  border-radius: 0px;
  clip-path: polygon(#{$clipInset} 0%, 0% 100%, calc(100% - #{$clipInset}) 100%, 100% 0%);
  background-color: $--color-black;
  color: darken($--color-white, 30%);
  border: 0px !important;
  width: 100%;
  height: $buttonHeight;
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
  background-color: $--color-black;//darken($--color-primary, 10%);
  color: $--color-white;
  border: 0px;
}

.rangeButtonParent:not(.active):hover {
  z-index: 2;
  background-color: $--color-white;//darken($--color-primary, 10%);
}

.rangeButtonParent.active {
  clip-path: polygon(#{$clipInset/$buttonHeight * ($activeheight + 2*$activePadding)} 0%, 0% 100%, calc(100% - #{$clipInset/$buttonHeight * ($activeheight + 2*$activePadding)}) 100%, 100% 0%);
  padding: $activePadding;
  background-color: $--color-white;
  z-index: 2;
}

.rangeButtonParent:nth-child(1).active {
  clip-path: polygon(0% 0%, 0% 100%, calc(100% - #{$clipInset/$buttonHeight * ($activeheight + 2*$activePadding)}) 100%, 100% 0%);
}
.rangeButtonParent:nth-child(3).active {
  clip-path: polygon(#{$clipInset/$buttonHeight * ($activeheight + 2*$activePadding)} 0%, 0% 100%, 100% 100%, 100% 0%);
}
.rangeButtonParent.active .rangeButton {
  clip-path: polygon(#{$clipInset/$buttonHeight * $activeheight} 0%, 0% 100%, calc(100% - #{$clipInset/$buttonHeight * $activeheight}) 100%, 100% 0%);
}
.rangeButtonParent:nth-child(1).active .rangeButton {
  clip-path: polygon(0% 0%, 0% 100%, calc(100% - #{$clipInset/$buttonHeight * $activeheight}) 100%, 100% 0%);
}
.rangeButtonParent:nth-child(3).active .rangeButton {
  clip-path: polygon(#{$clipInset/$buttonHeight * $activeheight} 0%, 0% 100%, 100% 100%, 100% 0%);
}
.rangeButtonParent.active .rangeButton{
  background-color: $--color-primary;
  color: $--color-white;
  height: $activeheight;
}
.rangeButtonParent.active .rangeButton:hover {
  background-color: $--color-primary;
  color: $--color-white;
  border: 0px;
}
</style>
