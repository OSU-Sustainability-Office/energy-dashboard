<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-04T10:08:23-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-11T10:19:37-08:00
-->

<template>
  <el-menu class='menu-stage' :default-active='index' mode='vertical' backgroundColor='#1A1A1A' @select='handleSelect'>
    <el-menu-item index='views'><i class="fas fa-square"></i> Views</el-menu-item>
    <el-menu-item index='alerts'><i class="fas fa-bell"></i> Alerts</el-menu-item>
    <el-menu-item index='admin' v-if='(user.privilege >= 5)'><i class="fas fa-tools"></i> Admin</el-menu-item>
  </el-menu>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  data () {
    return {
      index: 'views'
    }
  },
  methods: {
    handleSelect: function (index) {
      this.$emit('input', index)
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  }
}
</script>

<style lang='scss' scoped>
  .menu-stage {
    height: 100%;
  }
  .el-menu-item {
    color: $--color-white;
  }
  .fas {
    color: $--color-primary !important;
    font-size: 20px;
    padding: 0.4em;
  }
  .el-menu-item.is-active {
    color: $--color-white !important;
    background-color: lighten($--color-black, 10%) !important;
  }
  // .el-menu-item.is-active .fas {
  //   color: $--color-black !important;
  // }
</style>
