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
        <li class='nav-item' v-bind:class='[isActive("account") ? "active" : ""]'><a class="nav-link" href="#/account">Dashboard</a></li>
        <li class='nav-item' v-bind:class='[isActive("directory") ? "active" : ""]'><a class="nav-link" href="#/directory">Directory</a></li>
      </ul>
    </div>
    <div class='pos-right navbar-collapse collapse w-100 order-3 dual-collapse2'>
      <ul class="navbar-nav">
        <li class='nav-item'><a class='nav-link' :href='this.logOutLink'>Sign Out</a></li>
      </ul>
    </div>
  </nav>
</template>
<script>
export default {
  name: 'navigbar',
  data () {
    return {
      loggedIn: false,
      logOutLink: process.env.ROOT_API + 'logout'
    }
  },
  created () {
    this.$eventHub.$on('loggedIn', val => {
      this.loggedIn = true
    })
  },
  methods: {
    isActive: function (s) {
      if (s === 'account' && this.$route.path.search('public') > 0) { return true }
      if ('/' + s === this.$route.path) { return true }
      return false
    }
  }
}
</script>

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
    height: 100%;
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
