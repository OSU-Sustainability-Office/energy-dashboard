<template>
  <div class="nav">
    <div class="col">
      <a href="/"><img src="/static/images/logo.svg"></a>
    </div>
    <div class="col navItem">
      Dashboard
    </div>
    <div class="col navItem">
      <i v-if="loggedIn" class="fas fa-user navIcon"></i>
    </div>
  </div>
</template>

<script>
export default {
  name: 'navBar',
  data() {
    return {
      loggedIn : true
    }
  }
}
</script>

<style>
.navItem {
  color: #FFF;
  font-size: 1.2em;
  line-height: 2em;
  height: auto;
  margin: auto;
  width: 20%;
  flex-grow: 0;
  flex-shrink: 0;

}
.navIcon {
  font-size: 1.8em;
  line-height: 2em;
}
.nav {
  height: 5em;
  background: #D73F09;
  width: 100%;
}
img{
  padding: .25em;
  height: 4em;
}
</style>
