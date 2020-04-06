<template>
  <el-row>
    <el-col :span='24' class='cont'>
      <span class='title'>404</span>
      <br>
      <span class='body'>Page does not exist</span>
    </el-col>
  </el-row>
</template>
<script>

export default {
  name: '404',
  props: [],
  data () {
  },
  watch: {
  },
  mounted () {
  },
  methods: {
  }
}
</script>
<style lang='scss' scoped>
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
