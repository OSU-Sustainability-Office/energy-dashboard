<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-03T12:39:57-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-31T13:32:37-08:00
-->

<template>
  <el-row class='stage_compareside'>
    <el-col :span='24' class='innerContent'>
      <el-row class='title'>
        <el-col :span='23'>
          <span>{{ story.name }} </span>
        </el-col>
        <el-col :span='1' class='close-box'><i class="fas fa-times" @click="$emit('hide')"></i></el-col>
      </el-row>
      <el-row class='pics' v-loading='(story)? !story.loaded : true' element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-col :span='24' class='nowrap'>
          <div v-for='(media, index) in mediaArray' :class='classForIndex(index)' :style='`background-image: url("https://api.sustainability.oregonstate.edu/energy/images/${media}"); width:calc(${100 / ((mediaArray.length < 4) ? mediaArray.length : 4)}% + ${ (index === 0)? "22.5px" : "55px"});`' v-if='index < 4' :key='index'></div>
        </el-col>
      </el-row>
      <switchButtons @update='update()' />
      <el-row class='grid'>
        <el-col :span='24'>
          <chartController :randomColors='1' :graphType='1' :index='0' ref="lineChartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': 'calc(100% - 20px)','height': '100%', 'margin-right': '10px', 'margin-left': '10px' }" :height='300'/>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span='20' :offset='2' class='buttonParent'>
          <el-button class='bigButton' @click='$router.push({path: `/compare/${encodeURI(JSON.stringify(compareStories))}/${currentRange}`})'>View Full Graph</el-button>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
import chartController from '@/components/charts/chartController'
import switchButtons from '@/components/map/time_switch_buttons_big'
import { mapGetters } from 'vuex'

export default {
  components: {
    chartController, switchButtons
  },
  props: ['compareStories', 'storyId'],
  data () {
    return {
      currentRange: 1,
      mediaArray: [],
      titles: []
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block'
    ])
  },
  mounted () {
    this.$store.dispatch('compare', { stories: this.compareStories, dateStart: this.dateOffset(), dateEnd: (new Date()).toISOString(), interval: 1, unit: 'day' }).then(async callback => {
      this.mediaArray = this.story.media
      await callback()
      this.$refs.lineChartController.parse()
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
        d.setFullYear(d.getFullYear() - 1)
      }
      return d.toISOString()
    },
    update: function () {
      this.$refs.lineChartController.parse()
    },
    classForIndex: function (index) {
      if (this.mediaArray.length === 1) {
        return 'slantImage unCut'
      } else if (index === 0) {
        return 'slantImage leftEnd'
      } else if (index + 1 === this.mediaArray.length || index >= 3) {
        return 'slantImage rightEnd'
      } else {
        return 'slantImage'
      }
    }
  }
}
</script>
<style lang='scss' scoped>
.stage_compareside {
  position: absolute;
  top: 0;
  left: 250px;
  width: calc(100% - 250px);
  z-index: 401;
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
  border-radius: 5px;
  overflow: hidden;
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
.title > .el-col {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-right: 10px;
}
.close-box {
  cursor: pointer;
}
.pics {
  border-bottom: solid 1px $--color-white;
}
$slope: 160px / 4;
$border-width: 3px;
.nowrap {
  white-space: nowrap;
  overflow: hidden;
  height: 160px !important;
  background-color: $--color-white;
}
.slantImage {
  height: 100%;
  position: relative;
  top: 0;
  display: inline-block;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  clip-path: polygon(0% 100%, $slope 0%, 100% 0%, calc(100% - #{$slope}) 100%);
}
.slantImage:nth-child(1) {
  left: 0px;
}
.slantImage:nth-child(2) {
  left: -1 * $slope + $border-width;
}
.slantImage:nth-child(3) {
  left: -2 * $slope + 2*$border-width;
}
.slantImage:nth-child(4) {
  left: -3 * $slope + 3*$border-width;
}
.slantImage.rightEnd {
  clip-path: polygon(0% 100%, $slope 0%, 100% 0%, 100% 100%);
}
.slantImage.leftEnd {
  clip-path: polygon(0% 100%, 0% 0%, 100% 0%, calc(100% - #{$slope}) 100%);
}
.slantImage.unCut {
  clip-path: polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%);
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
.bigButton {
  background-color: $--color-black;
  color: darken($--color-white, 30%);
  border-color: darken($--color-white, 30%);
  width: 98%;
  margin-bottom: 1em;
}
.bigButton:hover {
  background-color: #000;
  color: $--color-white;
  border-color: $--color-white;
}
.bigButton:active {
  background-color: $--color-black;
  color: $--color-white;
  border-color: $--color-white;
}
.buttonParent {
  padding: 1em;
}
</style>
