<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-03T12:39:57-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-27T15:39:07-08:00
-->

<template>
  <el-row class='stage_prompt'>
    <el-col :span='24'>
      <el-row>
        <el-col class='text'>
          Select buildings to compare
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-dropdown split-button type="info" class='button' @click="handle('q')" @command="handle">
            Compare
            <el-dropdown-menu slot="dropdown">
              <el-dropdown-item command='q'>Quick Compare</el-dropdown-item>
              <el-dropdown-item command='d'>Compare in FullScreen</el-dropdown-item>
            </el-dropdown-menu>
          </el-dropdown>
          <el-button class='button' type='info' @click="$emit('cancel')">Cancel</el-button>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
export default {
  methods: {
    handle: function (command) {
      this.$emit('compare', command)
    }
  }
}
</script>
<style lang='scss' scoped>
.stage_prompt {
  width: 400px;
  height: 150px;
  position: absolute;
  top: 20px;
  left: calc(50% - 150px);
  background-color: rgba(0,0,0,0.8);
  color: $--color-white;
  z-index: 402;
  text-align: center;
}
.text {
  padding: 1.5em;
  font-size: 20px;
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
</style>
