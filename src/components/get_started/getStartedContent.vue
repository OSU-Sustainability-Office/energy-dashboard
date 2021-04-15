<template>
  <el-container>
    <el-main>
      <el-row>
        <getStartedBanner />
      </el-row>
      <el-row>
        The Energy Dashboard has been developed by the Oregon State University Sustainability Office to enable members of the OSU community to access, view, and analyze energy consumption trends.
      </el-row>
      <el-row>
        <faq />
      </el-row>
    </el-main>
</el-container>
</template>

<script>
import getStartedBanner from '@/components/get_started/getStartedBanner'
import faq from '@/components/get_started/faq'

export default {
  name: 'getStartedContent',
  components: {
    getStartedBanner,
    faq
  }
}
</script>

<style>

</style>
