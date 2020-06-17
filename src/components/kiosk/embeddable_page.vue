<!--
@Author: Adam Oberg <Aadm
@Date:   2020-05-06 T:22:00:00-22:30:00
@Email:  adam.oberg@oregonstate.edu
@Last modified by:   Adam
@Last modified time: 2020-05-06 T:22:00:00-22:30:00
-->

<template>
  <el-row class='stage'>
    <el-col>
      Hello World
    </el-col>
  </el-row>
</template>

<script>

export default {
  name: 'embeddable_page',
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
