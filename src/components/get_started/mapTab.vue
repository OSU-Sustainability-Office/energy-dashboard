<template>
  <el-tabs type="card" v-model="mapTab">
    <el-tab-pane label="Group By Category" name="first">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <video class="demo-visual" autoplay loop muted playsinline :src="mapCategoryDemo"></video>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-steps class="steps" direction="vertical" :space="200">
            <el-step
              status="process"
              title='Click on "Category" under "Group By:"'
              :description="mapCategoryStep1"
            ></el-step>
            <el-step status="process" title="Toggle the categories" :description="mapCategoryStep2"></el-step>
          </el-steps>
        </el-col>
      </el-row>
    </el-tab-pane>
    <el-tab-pane label="Group By Energy Trend" name="second">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-image class="demo-visual" :src="mapTrendDemo"></el-image>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-steps class="steps" direction="vertical" :space="200">
            <el-step
              status="process"
              title='Click on "Energy Trend" under "Group By:"'
              :description="mapEnergyTrendStep1"
            ></el-step>
            <el-step status="process" title="Green vs Red" :description="mapEnergyTrendStep2"></el-step>
          </el-steps>
        </el-col>
      </el-row>
    </el-tab-pane>
    <el-tab-pane label="View A Specific Building" name="third">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <video class="demo-visual" autoplay loop muted playsinline :src="mapBuildingDemo"></video>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-steps class="steps" direction="vertical" :space="200">
            <el-step status="process" title="View a building's metrics" :description="mapBuildingStep1"></el-step>
            <el-step status="process" title="View full graph" :description="mapBuildingStep2"></el-step>
          </el-steps>
        </el-col>
      </el-row>
    </el-tab-pane>
    <el-tab-pane label="Compare Buildings" name="fourth">
      <el-row :gutter="20">
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <video class="demo-visual" autoplay loop muted playsinline :src="mapCompareDemo"></video>
        </el-col>
        <el-col :xs="12" :sm="12" :md="12" :lg="12" :xl="12">
          <el-steps class="steps" direction="vertical" :space="200">
            <el-step status="process" title="View a specific building" :description="mapCompareStep1"></el-step>
            <el-step status="process" title="Add more buildings" :description="mapCompareStep2"></el-step>
          </el-steps>
        </el-col>
      </el-row>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
  data () {
    return {
      mapTab: 'first',
      mapCategoryDemo: 'https://energy-dashboard.s3-us-west-2.amazonaws.com/images/mapCategoryDemo.mp4',
      mapCategoryStep1:
        'This displays what category each building falls into. Hover over each building to see the name of it.',
      mapCategoryStep2:
        'To hide or unhide a category\'s energy usage, click on the name of the group ("Academics", "Athletics & Rec", "Dining", "Events & Admin", and/or "Residence").',
      mapTrendDemo: 'https://energy-dashboard.s3-us-west-2.amazonaws.com/images/mapTrendDemo.png',
      mapEnergyTrendStep1: 'This displays the last 60 day trend in energy consumption.',
      mapEnergyTrendStep2:
        'The more green the building is, the less energy it has used the past 60 days! Opposite for red.',
      mapBuildingDemo: 'https://energy-dashboard.s3-us-west-2.amazonaws.com/images/mapBuildingDemo.mp4',
      mapBuildingStep1:
        'On any "Group By:" view, click on any building to view its electricity metrics for the past week, 60 days, or year.',
      mapBuildingStep2:
        'If you click on "View Full Graph", it will show you all of the metrics a building has (i.e. Dixon Rec Center also shows steam metrics). Look at the next demo to see how the "Compare" feature works!',
      mapCompareDemo: 'https://energy-dashboard.s3-us-west-2.amazonaws.com/images/mapCompareDemo.mp4',
      mapCompareStep1: 'Click on 1 building to bring its metrics up. Click on "Compare" to start the comparison tool.',
      mapCompareStep2:
        'Click on as many additional buildings you want! A red circle with a white checkmark will appear on any buildings you want to compare to each other. When you\'re ready, click "Compare"!'
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
