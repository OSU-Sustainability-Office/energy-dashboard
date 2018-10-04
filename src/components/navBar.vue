<template>
  <!-- <nav class="navbar navbar-expand-sm">
    <a class="navbar-brand" href="/">
      <img src="static/images/logo.png" height=50 width=auto alt="">
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <i class="white fas fa-bars"></i>
    </button>
    <div class='pos-left collapse navbar-collapse' id="navbarSupportedContent">
      <ul class="navbar-nav">
        <li class='nav-item' v-bind:class='[isActive("map") ? "active" : ""]'><a class="nav-link" href="#/map">Map</a></li>

        <li class='nav-item' v-bind:class='[isActive("publicdir") ? "active" : ""]'><a class="nav-link" @click='move("/directory/public")'>Building List</a></li>
        <li class='nav-item' v-if='user !== null && user.name !== ""' v-bind:class='[isActive("privatedir") ? "active" : ""]'><a class="nav-link" @click='move("/directory/private")'>My Dashboard</a></li>
      </ul>
    </div>
    <div class='pos-right navbar-collapse collapse w-100 order-3 dual-collapse2'>
      <ul class="navbar-nav">
        <li class='nav-item' v-if='user !== null && user.name !== ""'><a class='nav-link' @click='logOut()'>Sign Out</a></li>
        <li class='nav-item' v-if='(user === null || user.name === "") && $route.path !== "/"'><a class='nav-link' :href='loginLink'>Sign In</a></li>
      </ul>
    </div>
     <b-modal size="lg" ref="dir" body-class="dirModal" hide-header hide-footer>
      <directory />
    </b-modal>
  </nav> -->
  <b-navbar toggleable='sm' class='navbar' type='dark'>
    <b-navbar-brand href='#'>
      <img src="static/images/logo.png" height=50 width=auto alt="">
    </b-navbar-brand>
    <b-navbar-toggle target="nav_collapse"></b-navbar-toggle>
    <b-collapse is-nav id="nav_collapse">
      <b-navbar-nav>
        <b-nav-item v-bind:class='[isActive("map") ? "active" : ""]' href="#/map">Map</b-nav-item>
        <b-nav-item v-bind:class='[isActive("publicdir") ? "active" : ""]' @click='move("/directory/public")'>Building List</b-nav-item>
        <b-nav-item v-if='user !== null && user.name !== ""' v-bind:class='[isActive("privatedir") ? "active" : ""]' @click='move("/directory/private")'>My Dashboard</b-nav-item>
      </b-navbar-nav>
      <b-navbar-nav class="ml-auto">
        <b-nav-item v-if='(user !== null && user.name !== "") && $route.path !== "/"' @click='logOut()'>Sign Out</b-nav-item>
        <b-nav-item v-if='(user === null || user.name === "") && $route.path !== "/"' :href='loginLink'>Sign In</b-nav-item>
      </b-navbar-nav>
    </b-collapse>
  </b-navbar>
</template>
<script>
import directory from '@/components/directory/directory.vue'
import { mapGetters } from 'vuex'

export default {
  name: 'navigbar',
  components: {directory},
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
      if (s === 'privatedir' && splitPath[0] === 'directory' && splitPath[1] === 'private') { return true }
      if (s === 'publicdir' && splitPath[0] === 'directory' && splitPath[1] === 'public') { return true }
      if (s === 'dashboard' && splitPath[0] === 'public') { return true }
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
<style scoped>
.navbar {
  background-color: #D73F09;
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
  .navbar-dark .navbar-nav not(.active):hover .nav-link {
    color: #000 !important;
  }
  .active {
    background-color: rgba(0,0,0,0.3);
  }
}
</style>
