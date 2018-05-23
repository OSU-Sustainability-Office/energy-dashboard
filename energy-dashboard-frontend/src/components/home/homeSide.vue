<template>
  <div id="home-side" v-bind:class="location"><h1>This is the home side stuff</h1>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.
  </div>
</template>

<script>
export default {
  name: 'homeSide',
  data () {
    return {
      location: 'right'
    }
  }
}
</script>

<style>
#home-side {
  position: absolute;
  top: 19em;
  padding: 1em;
  background-color: rgba(255,255,255,.85);
  max-width: 45%;
}
.left {
  left: 0px;
}
.right {
  right: 0px;
}
h1 {
  padding: .25em;
  padding-left: 0px;
  margin: 0px;
}
</style>
