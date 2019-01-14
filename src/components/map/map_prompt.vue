<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-03T12:39:57-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-09T13:37:10-08:00
-->

<template>
  <el-row class='stage'>
    <el-col :span='24'>
      <el-row>
        <el-col class='text'>
          Select another building to compare
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-button class='button' type='info' @click="$emit('cancel')">Cancel</el-button>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
</script>
<style lang='scss' scoped>
.stage {
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
}
.button:hover {
  border: solid 1px $--color-white;
}
.button:active {
  border: solid 1px $--color-white;
}
</style>
