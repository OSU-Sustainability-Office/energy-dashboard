<template>
  <el-container class='sus-nav'>
    <el-header>
      <el-row>
        <el-col :xs="9" :sm="7" :md="5" :lg="4" :xl="2">
          <img src="static/images/logo.png" height=60 width=auto alt="" class='sus-nav-image' @click='$router.push({path: "/"})'>
        </el-col>
        <el-col :xs="13" :sm="15" :md="15" :lg="18" :xl="21">
          <el-menu :default-active='activeIndex' mode='horizontal' backgroundColor='#00000000' class='sus-nav-menu' text-color='#FFFFFF' active-text-color='#1A1A1A' :router='true'>
            <el-menu-item index="map" :route='{path: "/map"}' ref='mapItem'>Map</el-menu-item>
            <el-menu-item index="buildinglist" :route='{path: "/buildinglist"}' ref='buildingItem'>Building List</el-menu-item>
            <el-menu-item v-if='(user !== null && user.name !== "") && $route.path !== "/"' index="dashboard" :route='{path: "/dashboard"}' ref='dashboardItem'>My Dashboard</el-menu-item>
          </el-menu>
        </el-col>
        <el-col :xs="2" :sm="2" :md="4" :lg="2" :xl="1">
          <a class='sus-nav-sign' v-if='(user !== null && user.name !== "") && $route.path !== "/"' @click='logOut()'>Sign Out</a>
          <a class='sus-nav-sign' v-if='(user === null || user.name === "") && $route.path !== "/"' :href='loginLink'>Sign In</a>
        </el-col>
      </el-row>
    </el-header>
  </el-container>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'navigbar',
  components: {},
  data () {
    return {
      loginLink: process.env.ROOT_API + '/auth/login?returnURI=' + process.env.HOST_ADDRESS + '/#/map',
      activeIndex: ''
    }
  },
  computed: {
    ...mapGetters([
      'user'
    ])
  },
  mounted () {
    this.$store.dispatch('user')
  },
  watch: {
    '$route.path': function (path) {
      this.activeIndex = path.split('/')[1]
      const buttons = [this.$refs.mapItem, this.$refs.buildingItem, this.$refs.dashboardItem]
      for (let item of buttons) {
        if (this.activeIndex !== item.index) {
          item.$el.classList.remove('is-active')
        } else {
          item.$el.classList.add('is-active')
        }
      }
    }
  },
  methods: {
    logOut: function () {
      this.$store.dispatch('logout')
    },
    handleSelect: function (select) {
      this.$router.push({ path: '/' + select })
      this.activeIndex = select
    }
  }
}
</script>
<style scoped lang='scss'>
@import '@/assets/style-variables.scss';

.sus-nav {
  background-color: $--color-primary;
  border-bottom: solid 1px $--color-white;
  height: $--nav-height !important;
  z-index: 2000;
}
.sus-nav-image {
  padding-top: ($--nav-height - 60) / 2;
  cursor: pointer;
}
.sus-nav-menu {
  height: $--nav-height !important;
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
  cursor: pointer;
}
.sus-nav-sign:hover {
  color: #000000 !important;
  text-decoration: none;
}
</style>
