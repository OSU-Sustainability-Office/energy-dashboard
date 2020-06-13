<!--
@Author: Adam Oberg <Aadm
@Date:   2020-05-06 T:22:00:00-22:30:00
@Email:  adam.oberg@oregonstate.edu
@Last modified by:   Adam
@Last modified time: 2020-05-06 T:22:00:00-22:30:00
-->

<template>
  <el-container class="app">
    <el-header class='header'>
    </el-header>
  <el-container>
    hello world
  </el-container>
    <el-main class='main' ref='main'>
        <router-view />
    </el-main>
  </el-container>
</template>

<script>

export default {
  name: 'embeddable-page',
  components: {
    navigbar
  },
  async created () {
  },
  data () {
  },
  beforeDestroy () {
  },
  methods: {
  },
  watch: {
  }
}

</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Open+Sans');
@font-face {
    font-family: 'StratumNo2';
    src: url('/fonts/StratumNo2-Bold.woff2') format('woff2'),
        url('/fonts/StratumNo2-Bold.woff') format('woff'),
        url('/fonts/StratumNo2-Bold.ttf') format('truetype'),
        url('/fonts/StratumNo2-Bold.svg#StratumNo2-Bold') format('svg');
    font-weight: bold;
    font-style: normal;
}
body {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
<style lang='scss'>
@import "~element-ui/packages/theme-chalk/src/index";
</style>

<style scoped lang='scss'>
@import '@/assets/style-variables.scss';

.app {
  padding: 0;
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
}
.header {
  margin: 0;
  padding: 0;
  height: $--nav-height;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.main {
  position: absolute;
  top: $--nav-height;
  left: 0;
  min-height: calc(100% - #{$--nav-height});
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>