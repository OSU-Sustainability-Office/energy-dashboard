<template>
    <el-row class='sus-nav'>
      <el-col :xs="9" :sm="7" :md="5" :lg="4" :xl="3">
        <svgLogo width=auto alt="" class='sus-nav-image' @click='$router.push({path: "/"})'/>
      </el-col>
      <el-col :xs="13" :sm="15" :md="15" :lg="18" :xl="20">
        <el-menu :default-active='activeIndex' mode='horizontal' backgroundColor='rgba(0,0,0,0)' class='sus-nav-menu' text-color='#FFFFFF' active-text-color='#1A1A1A' :router='true'>
          <el-menu-item index="map" :route='{path: "/map"}' ref='mapItem'>Map</el-menu-item>
          <el-menu-item index="buildings" :route='{path: "/buildings"}' ref='buildingItem'>Building List</el-menu-item>
          <el-menu-item index="campaigns" :route='{path: "/campaigns"}' ref='buildingItem'>Campaigns</el-menu-item>
          <el-menu-item v-if='onid' index="dashboard" :route='{path: "/dashboard"}' ref='dashboardItem'>My Dashboard</el-menu-item>
        </el-menu>
      </el-col>
      <el-col :xs="2" :sm="2" :md="4" :lg="2" :xl="1">
        <a class='sus-nav-sign' v-if='onid && $route.path !== "/"' :href='logoutLink'>Sign Out</a>
        <a class='sus-nav-sign' v-if='!onid && $route.path !== "/"' :href='loginLink'>Sign In</a>
      </el-col>
    </el-row>
</template>
<script>
import svgLogo from '../../public/images/logo.svg'

export default {
  name: 'navigbar',
  components: {
    svgLogo
  },
  data () {
    return {
      loginLink: 'https://api.sustainability.oregonstate.edu/v2/auth/login?returnURI=' + process.env.VUE_APP_HOST_ADDRESS + '/#/map',
      logoutLink: 'https://api.sustainability.oregonstate.edu/v2/auth/logout',
      activeIndex: ''
    }
  },
  computed: {
    onid: {
      get () {
        return this.$store.getters['user/onid']
      }
    }
  },
  mounted () {
    this.activeIndex = this.$route.path.split('/')[1]
  },
  watch: {
    '$route.path': function (path) {
      this.activeIndex = path.split('/')[1]
      const buttons = [this.$refs.mapItem, this.$refs.buildingItem, this.$refs.dashboardItem]
      for (let item of buttons) {
        if (!item) {
          continue
        }
        if (this.activeIndex !== item.index) {
          item.$el.classList.remove('is-active')
        } else {
          item.$el.classList.add('is-active')
        }
      }
    }
  }
}
</script>
<style scoped lang='scss'>
.sus-nav {
  background-color: $--color-primary !important;
  border-bottom: solid 1px $--color-white;
  height: $--nav-height !important;
  z-index: 2000;
  padding-left: 2em;
  padding-right: 2em;
  overflow: hidden;
}
.sus-nav-image {
  padding-top: 1px;
  padding-bottom: 1px;
  height: $--nav-height - 2px;
  cursor: pointer;
}
.sus-nav-menu {
  height: $--nav-height !important;
  border: none !important;
}
.sus-nav-menu > * {
  padding-top: 5px;
  height: $--nav-height - 2px !important;
  color: $--color-white;
  border: none;
}
.el-menu-item {
  color: $--color-white !important;
  border: none !important;
  height: 100% !important;
}
.sus-nav-menu > *:not(.is-active):hover {
  color: $--color-black !important;
  background-color: rgba(0,0,0,0) !important;
}
.sus-nav-menu > *.is-active {
  border-bottom: none !important;
  background-color: rgba(0,0,0,0.3) !important;
  color: $--color-white !important;
}
.sus-nav-menu > *:not(.is-active):hover:after {
  content: "\a0";
  display: block;
  padding: 0 2px;
  line-height: 1px;
  border-bottom: 3px solid #000;
}
.sus-nav-sign {
  color: #FFFFFF !important;
  height: $--nav-height !important;
  line-height: $--nav-height !important;
  text-decoration: none;
  cursor: pointer;
  transition: color 0.2s ease;
  font-size: 1.1em;
  text-overflow: ellipsis;
}
.sus-nav-sign:hover {
  color: #000000 !important;
  text-decoration: none;
}
</style>
