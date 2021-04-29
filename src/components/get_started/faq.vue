<template>
  <el-collapse v-model="activeNames" @change="handleChange">
  <el-collapse-item title="Who supports the dashboard?" name="1">
    <div>OSU’s Energy Dashboard is supported by a team of part-time student software developers at OSU’s Sustainability Office.</div>
  </el-collapse-item>
  <el-collapse-item title="How is the data collected?" name="2">
    <div>The data are collected using Obvius Data Acquisition Servers (AcquiSuites) located in 30+ buildings on OSU’s campus. Every 15 minutes, each server reports the most recent electricity, steam, and water meter observations.</div>
  </el-collapse-item>
  <el-collapse-item title="Why is the data collected in 15 minute intervals?" name="3">
    <div>Simplify the process: keep operating process simple and intuitive;</div>
    <div>Definite and clear: enunciate your intentions clearly so that the users can quickly understand and make decisions;</div>
    <div>Easy to identify: the interface should be straightforward, which helps the users to identify and frees them from memorizing and recalling.</div>
  </el-collapse-item>
  <el-collapse-item title="How much does this dashboard cost?" name="4">
    <div>Not including labor costs, hosting for OSU’s Energy Dashboard costs ~$40 per month.</div>
  </el-collapse-item>
  <el-collapse-item title="How can I deploy my own dashboard at my institution?" name="5">
    <div>We are currently exploring how to share our dashboard with other Organizations. For more information, contact Brandon Trelstad.</div>
  </el-collapse-item>
</el-collapse>
</template>

<script>
export default {
  data () {
    return {
      activeNames: []
    }
  },
  methods: {
    handleChange (val) {
      console.log(val)
    }
  }
}
</script>
