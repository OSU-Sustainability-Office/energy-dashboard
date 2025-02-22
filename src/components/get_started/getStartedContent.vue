<template>
  <el-container>
    <el-main>
      <el-row class="banner-row">
        <getStartedBanner />
      </el-row>
      <el-row class="main-description-row">
        <mainDescription />
      </el-row>
      <el-row class="faq-header-row">
        <h1 class="faq-header">Frequently Asked Questions (FAQ's):</h1>
      </el-row>
      <el-row class="faq-content-row">
        <faq />
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import getStartedBanner from '@/components/get_started/getStartedBanner.vue'
import faq from '@/components/get_started/faq.vue'
import mainDescription from '@/components/get_started/mainDescription.vue'

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
.banner-row,
.main-description-row,
.faq-header-row,
.faq-content-row {
  display: block;
}
.faq-header {
  text-align: center;
  font-weight: bold;
  color: #d73f09;
}
</style>
