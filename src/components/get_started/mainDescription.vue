<template>
  <div>
    <el-divider class="divider" content-position="left">
      Why We Created The Energy Dashboard
    </el-divider>
    <el-row>
      <el-col :span="12">
        The Energy Dashboard has been developed by the Oregon State University Sustainability Office to enable members of the OSU community to access, view, and analyze energy consumption trends.
      </el-col>
      <el-col :span="12">
        <el-image
          class="image"
          style="width: 400px; height: 250px"
          :src="pic1"
        >
        </el-image>
      </el-col>
    </el-row>
    <el-divider class="divider" content-position="left">
      How To Use The Energy Dashboard
    </el-divider>
    <el-row>
      <el-col :span="12">
        <el-row><h2>Map Tab:</h2></el-row>
        <el-row>
          <el-col>
            1.) Click on "Category" under "Group By:". This displays each category's energy usage. To hide or unhide a category's energy usage, click on the name of the group ("Academics", "Athletics & Rec", "Dining", "Events & Admin", and/or "Residence").
          </el-col>
          <el-col>
            <gif-player
              :src="categoryDemo"
              ></gif-player>
          </el-col>
        </el-row>
        <el-row>2.) Click on "Energy Trend" under "Group By:". This displays </el-row>
        <el-row>Step 3:</el-row>
        <el-row>Step 4:</el-row>
        <el-row><h2>Building Tab:</h2></el-row>
        <el-row>Step 1:</el-row>
        <el-row>Step 2:</el-row>
        <el-row>Step 3:</el-row>
        <el-row>Step 4:</el-row>
      </el-col>
      <el-col :span="12">
        <el-image
          class="image"
          style="width: 400px; height: 250px"
          :src="pic1"
        >
        </el-image>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data () {
    return {
      pic1: '/images/solar.jpg',
      pic2: '',
      categoryDemo: '/images/categoryEnergyDemo.mp4'
    }
  }
}
</script>

<style>

</style>
