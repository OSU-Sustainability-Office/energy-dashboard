<!--
  Filename: 404.vue
  Description: The 404 page that is displayed when a user tries to access a page that does not exist.
-->
<template>
  <el-row>
    <el-col :span="24" class="cont">
      <span class="title">404</span>
      <br />
      <span class="body">Page does not exist</span>
    </el-col>
  </el-row>
</template>
<script>
export default {
  name: 'NotFound'
}
</script>
<style lang="scss" scoped>
.cont {
  text-align: center;
  padding-top: 20%;
}
.title {
  font-size: 120px;
  color: rgb(223, 223, 223);
  font-family: 'open sans';
}
.body {
  font-size: 28px;
  color: rgb(119, 119, 119);
}
</style>
