<template>
  <nav class="navbar navbar-expand-sm">
    <a class="navbar-brand" href="/">
      <img src="/static/images/logo.png" height=50 width=auto alt="">
    </a>
    <button class="navbar-toggler" type="button" data-toggle="collapse" data-target="#navbarSupportedContent" aria-controls="navbarSupportedContent" aria-expanded="false" aria-label="Toggle navigation">
      <i class="fas fa-bars"></i>
    </button>
    <div class='pos-left collapse navbar-collapse' id="navbarSupportedContent">
      <ul class="navbar-nav">
        <li class='nav-item' v-bind:class='[isActive("map") ? "active" : ""]'><a class="nav-link" href="#/map">Map</a></li>
        <li class='nav-item' v-bind:class='[isActive("dashboard") ? "active" : ""]'><a class="nav-link" href="#/dashboard">Dashboard</a></li>
        <li class='nav-item' v-bind:class='[isActive("directory") ? "active" : ""]'><a class="nav-link" href="#/directory">Directory</a></li>
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
  </nav>
</template>
<script>
import directory from '@/components/directory/directory.vue'

export default {
  name: 'navigbar',
  components: {directory},
  data () {
    return {
      logOutLink: process.env.ROOT_API + 'logout',
      loginLink: process.env.ROOT_API + 'login',
      user: null
    }
  },
  mounted () {
    this.$store.dispatch('user').then(r => { this.user = r })
  },
  methods: {
    logOut: function () {
      this.$store.commit('loadUser', { name: '', privilige: 0 })
      window.location = this.logOutLink
    },
    isActive: function (s) {
      let splitPath = this.$route.path.substr(1).split('/')
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
.modal-content {
  background-color: rgba(0,0,0,0);
  border: none;
}
.dirModal {
  padding-top: 150px;
}
</style>

<style scoped>
@media (min-width: 576px) {
  .pos-left {
    position: absolute;
    top: 0;
    left: 15em;
    height: 4em;
  }
  .pos-right {
    position: absolute;
    top: 0;
    right: 0em;
    height: 4em;
    width: 8em !important;
  }
  .navbar-nav {
    height: 100%;
  }
  .navbar-nav li {
    height: calc(100% - 2px);
    padding: 1em;
  }
  .navbar-nav a {
    color: #FFF;
  }
  .navbar-nav li:not(.active):hover > a {
    color: #000;
  }
  .active {
    background-color: rgba(0,0,0,0.3);
  }
  .navbar {
    background-color: #D73F09;
    height: 4em;
    border-bottom: solid 1px rgb(226,226,226);
  }
  .navbar-toggler {
    padding: 0.6em;
    padding-top: 0.2em;
    padding-bottom: 0.2em;
    color: #FFF;
    border: solid 0.1em #FFF;
    font-size: 1.6em;
  }
}
</style>
