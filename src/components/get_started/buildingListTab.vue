<template>
  <div>
    <h2 class="demo-title">3 Options:</h2>
    <el-row>
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
        <el-steps class="steps" direction="vertical" :space="200">
          <el-step status="process" title="View All" :description="buildingStep1"></el-step>
          <el-step status="process" title="Category" :description="buildingStep2"></el-step>
          <el-step status="process" title="Search Bar" :description="buildingStep3"></el-step>
        </el-steps>
      </el-col>
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
        <el-image class="demo-visual" :src="buildingPic"></el-image>
      </el-col>
    </el-row>
  </div>
</template>

<script>
export default {
  data () {
    return {
      buildingPic: 'https://energy-dashboard.s3-us-west-2.amazonaws.com/images/buildingPic.jpg',
      buildingStep1:
        'When you click on the "Buildings" tab, the page will automatically show you all of the buildings in alphabetical order. Scroll through the list to find what you\'re looking for!',
      buildingStep2: 'Click on a category to see what buildings are in each category.',
      buildingStep3:
        'You can type out a building name in the search bar. It must be spelled correctly for the building to show up.'
    }
  }
}
</script>

<style>
.demo-visual {
  width: 85%;
  height: 85%;
  margin-bottom: 30px;
}
.demo-title {
  color: #d73f09;
  margin-bottom: 30px;
}
.steps {
  color: black;
  font-weight: bold;
}
</style>
