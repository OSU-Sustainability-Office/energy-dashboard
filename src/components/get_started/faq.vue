<template>
  <el-collapse v-model="activeNames">
    <el-collapse-item title="Who supports the dashboard?" name="1">
      <div>
        OSU’s Energy Dashboard is supported by a team of part-time student software developers at OSU’s Sustainability
        Office.
      </div>
    </el-collapse-item>
    <el-collapse-item title="How and when is the data collected?" name="2">
      <div>
        The data are collected using Obvius Data Acquisition Servers (AcquiSuites) located in 30+ buildings on OSU’s
        campus. Every 15 minutes, each server reports the most recent electricity, steam, and water meter observations.
      </div>
    </el-collapse-item>
    <el-collapse-item title="Why is the data collected in 15 minute intervals?" name="3">
      <div>
        The energy usage data is collected in 15 minute intervals as this is the utility industry standard for data
        measurement / verification.
      </div>
    </el-collapse-item>
    <el-collapse-item title="Why are some buildings not listed on the Dashboard?" name="5">
      <div>
        Not all of OSU's buildings are equipped with modern metering technology. Although we are working towards adding
        more meters, the process of installing meters is quite demanding and requires the entire building to be shut
        down.
      </div>
    </el-collapse-item>
    <el-collapse-item title="How can I submit questions or feedback?" name="7">
      <div>Please email us at <a href="mailto:sustainability@oregonstate.edu">sustainability@oregonstate.edu</a>.</div>
    </el-collapse-item>
  </el-collapse>
</template>

<script>
export default {
  data () {
    return {
      activeNames: []
    }
  }
}
</script>
