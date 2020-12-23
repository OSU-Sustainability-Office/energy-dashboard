<template>
  <el-container class='topcenter'>
    <el-main>
      <el-row>
        <el-col :span='2'>
          &nbsp;
        </el-col>
        <el-col :span='20' id="home-side" v-bind:class="location">
          <h1>OSU Energy Dashboard</h1>
          <p class='body'>This Energy Dashboard has been developed by the Oregon State University Sustainability Office to enable members of the OSU community to access, view, and analyze energy consumption trends.</p>
        </el-col>
        <el-col :span='2'>
          &nbsp;
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
export default {
  name: 'homeSide',
  data () {
    return {
      location: 'right'
    }
  }
}
</script>

<style scoped lang='scss'>
#home-side {
  background-color: rgb(255, 255, 255);
  box-shadow: 0px 0px 3px $--color-black;
  border-radius: 5px;
  padding: 2em;
}
h1 {
  padding: .25em;
  padding-left: 0px;
  margin: 0px;
  color: #000;
  font-size: 32px;
  font-weight: 800;
}
</style>
