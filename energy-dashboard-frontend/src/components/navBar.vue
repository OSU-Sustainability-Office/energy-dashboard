<template>
  <!-- <nav class="navbar navbar-expand-lg">
    <a class="navbar-brand" href="/">
      <img src="/static/images/logo.png" class="d-inline-block align-top" alt="">
    </a>
    <ul class="navbar-nav">
      <li><a role="button" v-bind:class='[isActive("map") ? "active" : ""]' href="#/map">Map</a></li>
      <li><a role="button" v-bind:class='[isActive("account") ? "active" : ""]' href="#/account">Dashboard</a></li>
      <dropdown tag="li" append-to-body>
        <a class="dropdown-toggle" role="button">Account</a>
        <template slot="dropdown">
            <li><a role="button" :href='this.logOutLink'>Sign Out</a></li>
        </template>
      </dropdown>
    </ul>
  </nav> -->
  <navbar>
    <a class="navbar-brand" slot="brand" href="/">
      <img src="/static/images/logo.png" class="d-inline-block align-top" alt="">
    </a>
    <template slot="collapse">
      <navbar-nav>
        <li><a role="button" href="#/map" v-bind:class='[isActive("map") ? "active" : ""]'>Map</a></li>
        <li><a role="button" href="#/directory" v-bind:class='[isActive("directory") ? "active" : ""]'>Directory</a></li>
        <li><a role="button" href="#/account" v-bind:class='[isActive("account") ? "active" : ""]'>Dashboard</a></li>
      </navbar-nav>
      <navbar-nav right>
        <dropdown tag="li" menu-right append-to-body >
          <a class="dropdown-toggle" role="button">Account</a>
          <template slot="dropdown" class="navD">
              <li><a role="button" :href='this.logOutLink'>Sign Out</a></li>
          </template>
        </dropdown>
      </navbar-nav>
    </template>
  </navbar>
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
<style>

.dropdown-menu {
  z-index: 2000;
  /* position: absolute;
  right: 20px !important; */
}
.dropdown-menu .navD {
  z-index: 2000;
  position: absolute;
  right: 20px !important;
}
</style>
<style scoped>
.navbar {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 100%;
  background-color: #D73F09;
  border: none;
  border-radius: 0;
  z-index: 3;
}
.navbar-nav {
  padding-left: 10em;
}
.navbar a {
  text-decoration: none;
  color: #FFF !important;
  font-size: 1.3em;
  padding: 1em;
}
.navbar-nav > li:not(.dropdown) > a:not(.active):hover  {
  color: #000 !important;
}
.active {
  background-color: rgba(0,0,0,0.2) !important;
}
img {
  position: absolute;
  top: 0.3em;
  left: 0.5em;
  height: 2.5em;
  width: auto;
}
.dropdown.open > * {
  background-color: rgba(0,0,0,0.2) !important;
}
</style>
