<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-09T13:21:44-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-14T11:12:06-08:00
-->
<template>
  <el-col :span='24' class='buildingContainer'>
    <el-row class='title'>
      <el-col :span='24'>
        Leaderboard
      </el-col>
    </el-row>
    <el-row class='buildingScroll'>
      <el-row class='buildingRow' v-for='(building, index) in buildings' :key='building.id' ref='buildingRows'>
        <el-col :class='[(activeId === building.id) ? "buildingCol selected" : "buildingCol"]' :span='24'>
          <div :class='[(activeId === building.id) ? "outerClip selected" : "outerClip"]'>
            <div :class='[(activeId === building.id) ? "innerClip selected" : "innerClip"]' @click='buildingClick(building)'>
              <i class="fas fa-trophy" v-if='index < 3'><span :class='[(activeId === building.id) ? "innerTrophy selected" : "innerTrophy"]'>{{ index + 1 }}</span></i> {{ building.name }}
            </div>
          </div>
        </el-col>
      </el-row>
    </el-row>
  </el-col>
</template>
<script>
export default {
  props: ['buildings'],
  data () {
    return {
      activeId: null
    }
  },
  methods: {
    buildingClick: function (building) {
      (this.activeId !== building.id) ? this.activeId = building.id : this.activeId = null
      this.$emit('clickedBuilding', building.index)
    }
  }
}
</script>
<style scoped lang='scss'>
  .title {
    font-size: 34px;
    color: $--color-white;
    font-family: "StratumNo2";
    text-align: center;
    padding-bottom: 1em;
  }
  .buildingContainer {
    background-color: $--color-black;
    border-radius: 5px;
    padding: 1em;
  }
  .buildingScroll {
    overflow-y: scroll;
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
    background-color: $--color-black;
  }
  $clippath: polygon(2.5% 0%, 0% 100%, 97.5% 100%, 100% 0%);
  .outerClip {
    padding: 0.05em;
    background-color: $--color-white;
    clip-path: $clippath;
  }
  .outerClip.selected {
    background-color: $--color-primary;
  }
  .innerClip {
    padding: 0.5em;
    padding-left: 1em;
    background-color: $--color-primary;
    clip-path: $clippath;
  }
  .innerClip.selected {
    background-color: $--color-white;
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
