<template>
  <b-navbar toggleable='sm' class='navbar' type='dark'>
    <b-navbar-brand href='/#/'>
      <img src="static/images/logo.png" height=50 width=auto alt="">
    </b-navbar-brand>
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item v-bind:class='[isActive("map") ? "active" : ""]' href="#/map">Map</b-nav-item>
        <b-nav-item v-bind:class='[isActive("buildinglist") ? "active" : ""]' @click='move("/buildinglist")'>Building List</b-nav-item>
        <b-nav-item v-if='user !== null && user.name !== ""' v-bind:class='[isActive("dashboard") ? "active" : ""]' @click='move("/dashboard")'>My Dashboard</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if='(user !== null && user.name !== "") && $route.path !== "/"' @click='logOut()'>Sign Out</b-nav-item>
        <b-nav-item v-if='(user === null || user.name === "") && $route.path !== "/"' :href='loginLink'>Sign In</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'navigbar',
  components: {},
  data () {
    return {
      loginLink: process.env.ROOT_API + '/auth/login?returnURI=' + process.env.HOST_ADDRESS + '/#/map'
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
  methods: {
    logOut: function () {
      this.$store.dispatch('logout')
    },
    move: function (v) {
      this.$router.push({path: v})
      this.$eventHub.$emit('updateDirectoryListings', [v.search('private')])
    },
    isActive: function (s) {
      let splitPath = this.$route.path.substr(1).split('/')
      if (s === splitPath[0]) { return true }
      return false
    },
    showDirectory: function () {
      this.$refs.dir.show()
    }
  }
}
</script>
<style>
.navbar-toggler-icon {
    background-image: url("data:image/svg+xml;charset=utf8,%3Csvg viewBox='0 0 32 32' xmlns='http://www.w3.org/2000/svg'%3E%3Cpath stroke='rgba(255,255,255, 1)' stroke-width='2' stroke-linecap='round' stroke-miterlimit='10' d='M4 8h24M4 16h24M4 24h24'/%3E%3C/svg%3E") !important;
}
.navbar-toggler {
  border-color: #FFF !important;
}
</style>
<style scoped lang='scss'>
@import '@/assets/style-variables.scss';

.navbar {
  background-color: $--color-primary;
  border-bottom: solid 1px rgb(226,226,226);
  z-index: 20;
}
.navbar-dark .navbar-nav .nav-link {
  color: #FFF;
}
@media (max-width: 576px){
  .navbar-dark .navbar-nav .active .nav-link {
    color: #000 !important;
  }
}

@media (min-width: 576px) {
  #nav_collapse {
    height: 100% !important;
    margin: 0 !important;
    padding: 0 !important;
  }
  .navbar {
    padding: 0 !important;
    margin: 0 !important;
  }
  .navbar-brand {
    padding-left: 1em;
    padding-right: 1em;
    margin: 0;
  }
  .navbar-nav {
    height: 100%;
  }
  .navbar-nav li {
    padding-left: 0.5em;
    padding-right: 0.5em;
    height: 80px;
    line-height: 60px;
  }
  .navbar-nav a {
    color: #FFF !important;
    cursor: pointer;
  }
  .nav-item:not(.active):hover  > a {
    color: #000 !important;
  }
  .active {
    background-color: rgba(0,0,0,0.3);
  }
}
</style>
