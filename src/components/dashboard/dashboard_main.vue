<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-04T10:08:23-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-11T11:26:01-08:00
-->

<template>
  <el-row class='stage'>
    <el-col :span='4' class='full-height no-overflow' v-if='user.privilege >= 2'>
      <sideview v-model='index'/>
    </el-col>
    <el-col :span='(user.privilege >= 2)?20:24' class='full-height'>
      <directory v-if='index === "views"'/>
      <alerts v-if='index === "alerts" && user.privilege >= 2'/>
      <admin v-if='index === "admin" && user.privilege >= 5'/>
    </el-col>
  </el-row>
</template>

<script>
import sideview from '@/components/dashboard/dashboard_sideview.vue'
import alerts from '@/components/dashboard/dashboard_alerts.vue'
import directory from '@/components/directory/directoryPrivate.vue'
import admin from '@/components/admin/admin.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    sideview,
    directory,
    alerts,
    admin
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  data () {
    return {
      index: 'views'
    }
  }
}
</script>

<style lang='scss' scoped>
.stage {
    position: absolute;
    top: 0;
    left: 0;
    height: calc(100vh - #{$--nav-height});
    width: 100%;
    margin: 0;
    padding: 0;
  }
  .full-height {
    height: 100%;
    overflow: scroll;
  }
  .no-overflow {
    overflow: hidden !important;
  }
</style>
