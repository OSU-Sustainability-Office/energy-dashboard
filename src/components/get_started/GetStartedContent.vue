<!--
  Filename: GetStartedContent.vue
  Description: The main content of the "Get Started" page. Serves as a layout for the
  Map and Building tabs, and includes a description of the Energy Dashboard.
-->
<template>
  <div>
    <el-divider class="divider" content-position="left"> Why We Created The Energy Dashboard </el-divider>
    <el-row>
      The Energy Dashboard has been developed by the Oregon State University Sustainability Office to enable members of
      the OSU community to access, view, and analyze energy consumption trends.
    </el-row>
    <el-divider class="divider" content-position="left"> How To Use The "Map" Tab </el-divider>
    <TutorialMapTab />
    <el-divider class="divider" content-position="left"> How To Use The "Buildings" Tab </el-divider>
    <TutorialBuildingTab />
  </div>
</template>

<script>
import TutorialMapTab from '@/components/get_started/TutorialMapTab.vue'
import TutorialBuildingTab from '@/components/get_started/TutorialBuildingTab.vue'

export default {
  components: {
    TutorialMapTab,
    TutorialBuildingTab
  },
  data () {
    return {
      pic1: '/images/solar.jpg'
    }
  }
}
</script>

<style>
.divider {
  background-color: #d73f09;
  margin-top: 40px;
  margin-bottom: 40px;
}
.create-image {
  width: 450px;
  height: 300px;
}
</style>
