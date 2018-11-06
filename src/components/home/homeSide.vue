<template>
  <el-container class='topcenter'>
    <el-main>
      <el-row>
        <el-col :span='2'>
          &nbsp;
        </el-col>
        <el-col :span='20' id="home-side" v-bind:class="location">
          <h1>OSU Energy Dashboard</h1>
          <p class='body'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
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

<style scoped>
#home-side {
  background-color: rgba(255,255,255,.85);
  padding: 2em;
}
h1 {
  padding: .25em;
  padding-left: 0px;
  margin: 0px;
  color: #000;
  font-size: 22px;
  font-weight: 800;
}
</style>
