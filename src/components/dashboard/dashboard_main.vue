<template>
  <el-row class='stage'>
    <el-col :span='4' class='full-height'>
      <sideview v-model='index'/>
    </el-col>
    <el-col :span='20' class='full-height'>
      <directory v-if='index === "views"'/>
      <alerts v-if='index === "alerts"'/>
    </el-col>
  </el-row>
</template>

<script>
import sideview from '@/components/dashboard/dashboard_sideview.vue'
import alerts from '@/components/dashboard/dashboard_alerts.vue'
import directory from '@/components/directory/directoryPrivate.vue'

export default {
  components: {
    sideview,
    directory,
    alerts
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
