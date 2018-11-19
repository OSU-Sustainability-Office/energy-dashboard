<template>
  <el-container class='topcenter'>
    <el-main>
      <el-row>
        <el-col :span='2'>
          &nbsp;
        </el-col>
        <el-col :span='20' id="home-side" v-bind:class="location">
          <h1>OSU Energy Dashboard</h1>
          <p class='body'>This Energy Dashboard has been developed to help members of the Oregon State University community understand the connection between their everyday actions and their carbon emissions. This is an important step in <a href='https://fa.oregonstate.edu/sustainability/planning-policy-assessment/institutional-carbon-neutrality/osu-carbon-planning'>Oregon State University’s initiative to be carbon neutral by 2025.</a></p>
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
  font-size: 32px;
  font-weight: 800;
}
</style>
