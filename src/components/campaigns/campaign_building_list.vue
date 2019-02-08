<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-09T13:21:44-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-05T11:18:22-08:00
-->
<template>
  <el-col :span='24' class='buildingContainer'>
    <el-row class='title'>
      <el-col :span='24'>
        Leaderboard
      </el-col>
    </el-row>
    <el-row class='buildingScroll' v-loading='!loaded' element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-row class='buildingRow' v-for='(building, index) in buildings' :key='building.id' ref='buildingRows'>
        <el-col :class='[(activeId === building.id) ? "buildingCol selected" : "buildingCol"]' :span='24'>
          <div :class='[(activeId === building.id) ? "outerClip selected" : "outerClip"]'>
            <div :class='[(activeId === building.id) ? "innerClip selected" : "innerClip"]' :style='`background-color:${ computedColor(building.accumulatedPercentage) };`' @click='buildingClick(building)'>
              <i class="fas fa-trophy" v-if='index < 3'><span :class='[(activeId === building.id) ? "innerTrophy selected" : "innerTrophy"]'>{{ index + 1 }}</span></i> {{ building.name }} {{ ((building.accumulatedPercentage > 0) ? '+' : '') + (Math.round(100 * building.accumulatedPercentage) / 100).toString() + '%' }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-row>
  </el-col>
</template>
<script>
export default {
  props: ['buildings', 'loaded'],
  data () {
    return {
      activeId: null
    }
  },
  methods: {
    buildingClick: function (building) {
      (this.activeId !== building.id) ? this.activeId = building.id : this.activeId = null
      this.$emit('clickedBuilding', building.index)
    },
    computedColor: function (percentage) {
      // #d62326 - Bottom Red
      // #19a23a - Top Green
      const redInt = [parseInt('0xd6', 16), parseInt('0x23', 16), parseInt('0x26', 16)]
      const greenInt = [parseInt('0x19', 16), parseInt('0xa2', 16), parseInt('0x3a', 16)]
      const typicalColor = [redInt[0] - greenInt[0], greenInt[1] - redInt[1], greenInt[2] - redInt[2]]
      const compare = Math.abs(percentage) / 7.5
      const result = []
      if (percentage < -7.5) {
        result.push(greenInt[0])
        result.push(greenInt[1])
        result.push(greenInt[2])
      } else if (percentage > 7.5) {
        result.push(redInt[0])
        result.push(redInt[1])
        result.push(redInt[2])
      } else if (percentage < 0) {
        result.push(Math.round(typicalColor[0] - redInt[0] * compare))
        result.push(Math.round(typicalColor[1] + redInt[1] * compare))
        result.push(Math.round(typicalColor[2] + redInt[2] * compare))
      } else {
        result.push(Math.round(typicalColor[0] + greenInt[0] * (compare)))
        result.push(Math.round(typicalColor[1] - greenInt[1] * (compare)))
        result.push(Math.round(typicalColor[2] - greenInt[2] * (compare)))
      }
      return 'rgb(' + result[0].toString() + ',' + result[1].toString() + ',' + result[2].toString() + ')'
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
  .buildingContainer {
    background-color: $--color-black;
    border-radius: 5px;
    padding: 1em;
  }
  .buildingScroll {
    overflow-y: scroll;
    height: calc(100% - 5em);
    border-radius: 5px;
  }
  .buildingRow {
    padding: 0.5em;
    padding-right: 1em;
  }
  .buildingCol {
    font-size: 24px;
    color: $--color-white;
    font-family: "StratumNo2";
    cursor: pointer;
  }
  .buildingCol.selected {
    color: $--color-primary;
  }
  .buildingCol:hover .innerClip:not(.selected) {
    background-color: $--color-black !important;
  }
  $clippath: polygon(2.5% 0%, 0% 100%, 97.5% 100%, 100% 0%);
  .outerClip {
    padding: 0.05em;
    background-color: $--color-white;
    clip-path: $clippath;
  }
  .outerClip.selected {
    background-color: $--color-white;
  }
  .innerClip {
    padding: 0.5em;
    padding-left: 1em;
    clip-path: $clippath;
  }
  .innerClip.selected {
    background-color: $--color-white !important;
  }
  .fa-trophy {
    position: relative;
  }
  .innerTrophy {
    position: absolute;
    z-index: 100;
    top: 1px;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 16px;
    color: $--color-primary;
    font-family: "StratumNo2";
  }
  .innerTrophy.selected {
    color: $--color-white;
  }
</style>
