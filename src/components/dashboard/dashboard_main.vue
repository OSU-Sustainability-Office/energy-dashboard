<template>
  <el-row class='stage'>
    <el-col :span='4' class='full-height' v-if='user.privilege >= 2'>
      <sideview v-model='index'/>
    </el-col>
    <el-col :span='(user.privilege >= 2)?20:24' class='full-height'>
      <directory v-if='index === "views"'/>
      <alerts v-if='index === "alerts" && user.privilege >= 2'/>
    </el-col>
  </el-row>
</template>

<script>
import sideview from '@/components/dashboard/dashboard_sideview.vue'
import alerts from '@/components/dashboard/dashboard_alerts.vue'
import directory from '@/components/directory/directoryPrivate.vue'

import { mapGetters } from 'vuex'

export default {
  components: {
    sideview,
    directory,
    alerts
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
  @import '@/assets/style-variables.scss';

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
  }
</style>
