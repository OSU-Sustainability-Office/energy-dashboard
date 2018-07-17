<template>
  <nav class="navbar navbar-expand-lg">
    <a class="navbar-brand" href="/">
      <img src="/static/images/logo.png" class="d-inline-block align-top" alt="">
    </a>
    <ul class="navbar-nav" v-if='loggedIn'>
      <li><a role="button" v-bind:class='[isActive("account") ? "active" : ""]' href="#/account">Dashboard</a></li>
      <dropdown tag="li" append-to-body>
        <a class="dropdown-toggle" role="button">Account</a>
        <template slot="dropdown">
            <li><a role="button">Sign Out</a></li>
        </template>
      </dropdown>
    </ul>
  </nav>
</template>
<script>
export default {
  name: 'navigbar',
  data() {
    return {
      loggedIn : false,
    }
  },
  created () {
    this.$eventHub.$on('loggedIn', val => {
      this.loggedIn = true;
    });
  },
  methods: {
    isActive: function(s) {
      if ("/" + s === this.$route.path)
        return true;
      return false;
    }
  }
}
</script>

<style scoped>
.navbar {
  position: absolute;
  top: 0px;
  right: 0px;
  width: 100%;
  padding: 0.2em;
  background-color: #D73F09;
  border: none;
  border-radius: 0;
  z-index: 3;
}
.navbar a {
  text-decoration: none;
  color: white;
}
.dropdown > * > a {
  color: black;
}
.navbar-nav {
  position: absolute;
  right: 0.2em;
}
.navbar-nav > * {
  font-size: 1.4em;
  color: #fff;
}
.active {
  background-color: rgba(0,0,0,0.2);
}
a {
  padding: 1em;
}
img {
  position: absolute;
  top: 0.3em;
  left: 0.3em;
  height: 2.5em;
  width: auto;
}

</style>
