<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-03T12:39:57-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-27T15:39:07-08:00
-->

<template>
  <el-row class="stage_prompt">
    <el-col :span="24">
      <el-row>
        <el-col class="text">
          Select buildings by clicking on map or using building menu search bar.<br /><br />
          Select one building (Any Energy Type) for comparison across multiple time periods <br /><br />
          Select multiple buildings (Electricity) to be compared across a single time period<br /><br />
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-dropdown
            split-button
            type="info"
            class="button"
            v-if="compareStories && compareStories.length !== 1"
            @click="handle('q')"
            @command="handle"
          >
            Compare ({{ Math.min(4, compareStories.length) }} Buildings)
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command="q">Quick Compare</el-dropdown-item>
              <el-dropdown-item command="d">Compare in FullScreen</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button
            type="info"
            class="button"
            v-if="compareStories && compareStories.length === 1"
            @click="handle('d')"
            @command="handle"
          >
            Compare (1 Building)
          </el-button>
          <el-button class="button" type="info" @click="$emit('cancel')">Cancel</el-button>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
export default {
  props: {
    compareStories: {
      type: Array
    }
  },
  methods: {
    handle: function (command) {
      this.$emit('compare', command)
    }
  }
}
</script>
<style lang="scss" scoped>
.stage_prompt {
  width: 400px;
  height: 210px;
  position: absolute;
  top: 20px;
  left: calc(50% - 200px);
  background-color: rgba(0, 0, 0, 0.8);
  color: $--color-white;
  z-index: 402;
  text-align: center;
}
.text {
  padding: 1.5em;
  font-size: 18px;
}
.button {
  border: solid 1px $--color-white;
  border-radius: 5px;
  margin: 10px;
}
.button:hover {
  border: solid 1px $--color-white;
}
.button:active {
  border: solid 1px $--color-white;
}
@media only screen and (max-width: 600px) {
  .stage_prompt {
    top: 100px;
    width: 330px;
    left: 250px;
    height: 380px;
  }
}
</style>
