<template>
  <el-row class="stage_prompt">
    <el-col :span="24">
      <el-row>
        <el-col class="text">
          ERROR <br />
          <el-row
            >You have either not selected any buildings for comparison, or you have included a non-electric building
            (for multiple buildings comparison).</el-row
          >
        </el-col>
      </el-row>
      <el-row>
        <el-col>
          <el-button class="button" type="info" @click="$emit('cancel')">Go back</el-button>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
export default {}
</script>
<style lang="scss" scoped>
.stage_prompt {
  width: 400px;
  height: 170px;
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
@media only screen and (max-width: 600px) {
  .stage_prompt {
    top: 80px;
    width: 330px;
    left: 250px;
    height: 210px;
  }
}
</style>
