<template>
  <div>
    <el-divider class="divider" content-position="left">
      Why We Created The Energy Dashboard
    </el-divider>
    <el-row :gutter="20">
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
        The Energy Dashboard has been developed by the Oregon State University Sustainability Office to enable members of the OSU community to access, view, and analyze energy consumption trends.
      </el-col>
      <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
        <el-image
          class="image"
          :src="pic1"
        >
        </el-image>
      </el-col>
    </el-row>
    <el-divider class="divider" content-position="left">
      How To Use The Energy Dashboard
    </el-divider>
    <h2 class="tab">"Map" Tab (Group By Category):</h2>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <video
            class="gif"
            autoplay loop muted playsinline
            :src="categoryDemo"
            ></video>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-steps class="steps" direction="vertical" :space="200">
            <el-step title="Step 1" :description="mapCategoryStep1"></el-step>
            <el-step title="Step 2" :description="mapCategoryStep2"></el-step>
          </el-steps>
        </el-col>
      </el-row>
    <h2 class="tab">"Map" Tab (Group By Energy Trend):</h2>
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <video
            class="gif"
            autoplay loop muted playsinline
            :src="categoryDemo"
            ></video>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-steps direction="vertical" :space="200">
            <el-step title="Step 1" :description="mapEnergyTrendStep1"></el-step>
          </el-steps>
        </el-col>
      </el-row>
    <h2 class="tab">"Building List" Tab:</h2>
      <el-row>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <video
            class="gif"
            autoplay loop muted playsinline
            :src="categoryDemo"
            ></video>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-steps direction="vertical" :space="200">
            <el-step title="Step 1" :description="buildingStep1"></el-step>
            <el-step title="Step 2" :description="buildingStep2"></el-step>
            <el-step title="Step 3" :description="buildingStep3"></el-step>
          </el-steps>
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
      categoryDemo: 'https://energy-dashboard.s3-us-west-2.amazonaws.com/images/categoryDemo.mp4',
      mapCategoryStep1: 'Click on "Category" under "Group By:". This displays what category each building falls into. Hover over each building to see the name of it.',
      mapCategoryStep2: 'To hide or unhide a category\'s energy usage, click on the name of the group ("Academics", "Athletics & Rec", "Dining", "Events & Admin", and/or "Residence").',
      mapEnergyTrendStep1: 'Click on "Energy Trend" under "Group By:". This displays the last 60 day trend in energy consumption.',
      buildingStep1: '',
      buildingStep2: '',
      buildingStep3: ''
    }
  }
}
</script>

<style>
.divider {
  background-color: #D73F09;
  margin-bottom: 60px
}
.image {
  width: 450px;
  height: 300px
}
.gif {
  width: 100%;
  height: 400px
}
.tab {
  color: #D73F09
}
.steps {
  --color: black;
  font-weight: bold
}
</style>
