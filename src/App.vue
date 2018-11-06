<template>
  <el-container class="app">
    <el-header class='header'>
      <navigbar />
    </el-header>
    <el-main class='main'>
      <transition v-bind:name="transitionName">
        <router-view />
      </transition>
    </el-main>
  </el-container>
</template>

<script>
import navigbar from '@/components/navBar'

export default {
  name: 'App',
  components: {
    navigbar
  },
  data () {
    return {
      transitionName: 'pageTo'
    }
  },
  beforeDestroy () {
  },
  watch: {
    $route: function (to, from) {
      // transition in
      if (to.path.length > from.path.length) {
        this.transitionName = 'pageTo'
      } else { // transition out
        this.transitionName = 'pageFrom'
      }
    }
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
/* @import url('/static/css/c3.min.css'); */
body {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.pageTo-enter-active, .pageTo-leave-active {
  transition-property: opacity, transform;
  transition-duration: 1s;
}

/* .page-enter-active {
  transition-delay: 1s;
} */
.pageTo-enter {
  transform: scale(0.5);
  position: absolute;
  overflow: visible;
}
.pageTo-leave-active {
  transform: scale(2);
}
.pageTo-enter, .pageTo-leave-active {
  opacity: 0;

}
.pageFrom-enter-active, .pageFrom-leave-active {
  transition-property: opacity, transform;
  transition-duration: 1s;
}

/* .page-enter-active {
  transition-delay: 1s;
} */
.pageFrom-enter {
  transform: scale(2);
  position: absolute;
  overflow: visible;
}
.pageFrom-leave-active {
  transform: scale(0.5);
}
.pageFrom-enter, .pageFrom-leave-active {
  opacity: 0;

}
/* .pageTransition-leave-actiev {

} */
</style>

<style scoped lang='scss'>
@import '@/assets/style-variables.scss';

.app {
  padding: 0;
  margin: 0;
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  min-height: 100%;
}
.header {
  margin: 0;
  padding: 0;
  height: $--nav-height;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.main {
  position: absolute;
  top: $--nav-height;
  left: 0;
  min-height: calc(100% - #{$--nav-height});
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>
