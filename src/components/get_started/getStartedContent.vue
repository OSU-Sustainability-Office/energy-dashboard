<template>
  <el-container>
    <el-main>
      <el-row>
        <getStartedBanner />
      </el-row>
      <el-row>
        <mainDescription />
      </el-row>
      <el-row>
        <h1 class="faq">Frequently Asked Questions (FAQ's):</h1>
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
import mainDescription from '@/components/get_started/mainDescription'

export default {
  name: 'getStartedContent',
  components: {
    getStartedBanner,
    faq,
    mainDescription
  }
}
</script>

<style>
.el-row {
  margin-bottom: 0px;
}
.faq {
  text-align: center;
  font-weight: bold;
  color: #d73f09;
}
</style>
