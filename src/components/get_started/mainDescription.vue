<template>
  <div>
    <el-divider class="divider" content-position="left"> Why We Created The Energy Dashboard </el-divider>
    <el-row>
      The Energy Dashboard has been developed by the Oregon State University Sustainability Office to enable members of
      the OSU community to access, view, and analyze energy consumption trends.
    </el-row>
    <el-divider class="divider" content-position="left"> How To Use The "Map" Tab </el-divider>
    <mapTab />
    <el-divider class="divider" content-position="left"> How To Use The "Buildings" Tab </el-divider>
    <buildingListTab />
  </div>
</template>

<script>
import mapTab from '@/components/get_started/mapTab.vue'
import buildingListTab from '@/components/get_started/buildingListTab.vue'

export default {
  components: {
    mapTab,
    buildingListTab
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
