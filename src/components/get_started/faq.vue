<template>
  <el-collapse v-model="activeNames" >
    <el-collapse-item title="Who supports the dashboard?" name="1">
      <div>OSU’s Energy Dashboard is supported by a team of part-time student software developers at OSU’s Sustainability Office.</div>
    </el-collapse-item>
    <el-collapse-item title="How and when is the data collected?" name="2">
      <div>The data are collected using Obvius Data Acquisition Servers (AcquiSuites) located in 30+ buildings on OSU’s campus. Every 15 minutes, each server reports the most recent electricity, steam, and water meter observations.</div>
    </el-collapse-item>
    <el-collapse-item title="Why is the data collected in 15 minute intervals?" name="3">
      <ul>
        <li>Simplify the process: keep operating process simple and intuitive;</li>
        <li>Definite and clear: enunciate your intentions clearly so that the users can quickly understand and make decisions;</li>
        <li>Easy to identify: the interface should be straightforward, which helps the users to identify and frees them from memorizing and recalling.</li>
      </ul>
    </el-collapse-item>
    <el-collapse-item title="How much does this dashboard cost?" name="4">
      <div>Not including maintenance costs, hosting for OSU’s Energy Dashboard costs ~$40 per month.</div>
    </el-collapse-item>
    <el-collapse-item title="Why are some buildings not listed on the Dashboard?" name="5">
      <div>Not all of OSU's buildings are equipped with modern metering technology. Although we are working towards adding more meters, the process of installing meters is quite demanding and requires the entire building to be shut down.</div>
    </el-collapse-item>
    <el-collapse-item title="How can I deploy my own dashboard at my institution?" name="6">
      <div>We are currently exploring how to share our dashboard with other Organizations. For more information, contact the Sustainability Office at sustainability@oregonstate.edu</div>
    </el-collapse-item>
    <el-collapse-item title="How can I submit questions or feedback?" name="7">
      <div>Please fill out this <a href="https://forms.gle/6CagStFL9d5CBk9j6">Google form here</a>! This will get sent to the Sustainability Office and we will get back to you as soon as we can.</div>
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
