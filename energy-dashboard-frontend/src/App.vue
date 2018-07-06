<template>
  <div class="app">
    <navBar />
    <transition name="page">
      <router-view/>
    </transition>
  </div>
</template>

<script>
import navBar from '@/components/navBar'

export default {
  name: 'App',
  components: {
    navBar
  },
  created() {

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
@import url('/static/css/c3.min.css');
body {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.page-enter-active, .page-leave-active {
  transition-property: opacity, transform;
  transition-duration: 1s;
}

/* .page-enter-active {
  transition-delay: 1s;
} */
.page-enter {
  transform: scale(0.5);
}
.page-leave-active {
  transform: scale(2);
}
.page-enter, .page-leave-active {
  opacity: 0;

}
/* .pageTransition-leave-actiev {

} */
</style>
