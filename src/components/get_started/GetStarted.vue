<!--
  Filename: GetStarted.vue
  Description: Contains the main layout for the "Get Started" page. It includes a
  banner, a description of how to use the dashboard, and a FAQ section.
-->
<template>
  <el-container>
    <el-main>
      <el-row class="banner-row">
        <GetStartedBanner />
      </el-row>
      <el-row class="main-description-row">
        <GetStartedContent />
      </el-row>
      <el-row class="faq-header-row">
        <h1 class="faq-header">Frequently Asked Questions (FAQ's):</h1>
      </el-row>
      <el-row class="faq-content-row">
        <FAQ />
      </el-row>
    </el-main>
  </el-container>
</template>

<script>
import GetStartedBanner from '@/components/get_started/GetStartedBanner.vue'
import FAQ from '@/components/get_started/FAQ.vue'
import GetStartedContent from '@/components/get_started/GetStartedContent.vue'

export default {
  name: 'GetStartedPage',
  components: {
    GetStartedBanner,
    FAQ,
    GetStartedContent
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
