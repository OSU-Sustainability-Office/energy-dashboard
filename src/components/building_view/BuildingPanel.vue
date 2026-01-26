<!--
  Filename: BuildingPanel.vue
  Info: Displays a single chart for a dataset from the "buildings" directory.
-->
<template>
  <div
    class="buildingPanel-tesla-iframe"
    ref="buildingPanel"
    v-if="
      this.path === 'map/building_35/block_175' ||
      this.path === 'map/building_36/block_176' ||
      this.path === 'map/building_37/block_177' ||
      this.path === 'map/building_38/block_178' ||
      this.path === 'map/building_85/block_264'
    "
  >
    <el-row :span="24" class="title" ref="title">
      <el-col :span="20">{{ name }}</el-col>
    </el-row>
    <!--Chart Below-->
    <el-row style="overflow: hidden" :span="24">
      <el-col :span="24">
        <!--If you change the "height" attribute here, remember to also change the chart-height variable in the scss-->
        <ChartController
          :randomColors="1"
          :path="path"
          ref="ChartController"
          class="chart"
          :styleC="style"
          :height="550"
        />
      </el-col>
    </el-row>
    <p v-if="this.path === 'map/building_35/block_175'">
      <a
        href="https://mysolarcity.com/Share/007c9349-72ba-450c-aa1f-4e5a77b68f79#/monitoring/historical/month"
        target="_blank"
        >Data Provided by Tesla</a
      >
    </p>
    <p v-if="this.path === 'map/building_36/block_176'">
      <a
        href="https://mysolarcity.com/share/9D5EB0D2-E376-44A1-9B8C-8DFCDD7507A5#/monitoring/historical/month"
        target="_blank"
        >Data Provided by Tesla</a
      >
    </p>
    <p v-if="this.path === 'map/building_37/block_177'">
      <a
        href="https://mysolarcity.com/Share/38954c21-8669-47b6-8376-835cc24f908c#/monitoring/historical/month"
        target="_blank"
        >Data Provided by Tesla</a
      >
    </p>
    <p v-if="this.path === 'map/building_38/block_178'">
      <a
        href="https://mysolarcity.com/Share/47cf089a-5b93-4200-8566-e030cb4f8574#/monitoring/historical/month"
        target="_blank"
        >Data Provided by Tesla</a
      >
    </p>
    <p v-if="this.path === 'map/building_85/block_264'">
      <a
        href="https://mysolarcity.com/share/BB1ABBE8-1FB9-4C17-BB0A-A1DE9339DB1C#/monitoring/historical/month"
        target="_blank"
        >Data Provided by Tesla</a
      >
    </p>
    <p>
      <a href="https://sustainability.oregonstate.edu/ground-mounted-photovoltaic-arrays" target="_blank"
        >More Info About OSU's Partnership with Tesla</a
      >
    </p>
  </div>
  <div class="buildingPanel" ref="buildingPanel" v-else>
    <el-row :span="24" class="title" ref="title">
      <el-col :span="20">{{ name }}</el-col>
      <el-col :span="4" class="right">&nbsp;<i class="fas fa-sliders-h" @click="openModal()"></i></el-col>
    </el-row>
    <!--Next/Previous Buttons-->
    <el-row :span="24">
      <el-col :span="12" class="buttonDisplay">
        <el-button size="small" type="primary" class="moveButtons" @click="previousInterval"> Previous </el-button>
      </el-col>
      <el-col :span="12">
        <el-row type="flex" justify="end">
          <el-button size="small" type="primary" class="moveButtons" @click="nextInterval" :disabled="!nextExists">
            Next
          </el-button>
        </el-row>
      </el-col>
    </el-row>
  </div>
</template>
