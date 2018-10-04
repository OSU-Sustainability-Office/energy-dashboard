<template>
  <div class='topcenter container-fluid'>
    <div class='row'>
      <div class='col-10 ml-auto mr-auto' id="home-side" v-bind:class="location">
        <h1>OSU Energy Dashboard</h1>
        <p class='body'>Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt ut labore et dolore magna aliqua. Ut enim ad minim veniam, quis nostrud exercitation ullamco laboris nisi ut aliquip ex ea commodo consequat. Duis aute irure dolor in reprehenderit in voluptate velit esse cillum dolore eu fugiat nulla pariatur. Excepteur sint occaecat cupidatat non proident, sunt in culpa qui officia deserunt mollit anim id est laborum.</p>
      </div>
    </div>
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
  background-color: rgba(255,255,255,.85);
  padding: 1em;
}
h1 {
  padding: .25em;
  padding-left: 0px;
  margin: 0px;
}
@media screen and (max-width: 900px) {
  .topcenter {
    margin-top: 15%;
  }
  .body {
     font-size: 16px;
  }
  h1 {
    font-size: 24px;
  }
}
@media screen and (max-width: 575px) {
  .topcenter {
    margin-top: 15%;
  }
  .body {
     font-size: 12px;
  }
  h1 {
    font-size: 20px;
  }
}
</style>
