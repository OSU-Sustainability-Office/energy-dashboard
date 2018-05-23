<template>
  <div id="app">
    <navBar />
    <router-view/>
  </div>
</template>

<script>
import navBar from '@/components/navBar';

export default {
  name: 'App',
  components: {
    navBar
  }
}
</script>

<style>
@import url('https://fonts.googleapis.com/css?family=Open+Sans');
@font-face {
    font-family: 'StratumNo2';
    src: url('/static/fonts/StratumNo2-Bold.woff2') format('woff2'),
        url('/static/fonts/StratumNo2-Bold.woff') format('woff'),
        url('/static/fonts/StratumNo2-Bold.ttf') format('truetype'),
        url('/static/fonts/StratumNo2-Bold.svg#StratumNo2-Bold') format('svg');
    font-weight: bold;
    font-style: normal;
}
body {
  margin: 0px;
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
</style>
