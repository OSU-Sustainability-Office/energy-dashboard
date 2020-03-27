<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-04T10:08:23-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-11T20:41:56-08:00
-->

<template>
  <el-container class="app">
    <el-header class='header'>
      <navigbar />
    </el-header>
    <el-main class='main' ref='main'>
      <!-- <transition v-bind:name="transitionName" v-on:after-leave="enableScroll" v-on:before-enter="disableScroll"> -->
        <router-view />
      <!-- </transition> -->
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
  created () {
    let mapPromise = this.$store.dispatch('map/loadMap')
    this.$store.commit('map/promise', mapPromise)
    this.$store.dispatch('user/user')
    this.$store.dispatch('campaigns/loadCampaigns')
    // this.$store.commit('user/promise', userPromise)
  },
  data () {
    return {
      transitionName: 'pageTo'
    }
  },
  beforeDestroy () {
  },
  methods: {
    disableScroll: function () {
      this.$refs.main.$el.style.overflow = 'hidden'
    },
    enableScroll: function () {
      this.$refs.main.$el.style.overflow = 'auto'
    }
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
    src: url('/fonts/StratumNo2-Bold.woff2') format('woff2'),
        url('/fonts/StratumNo2-Bold.woff') format('woff'),
        url('/fonts/StratumNo2-Bold.ttf') format('truetype'),
        url('/fonts/StratumNo2-Bold.svg#StratumNo2-Bold') format('svg');
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
  transform: scale(0.75);
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
  transform: scale(0.75);
}
.pageFrom-enter, .pageFrom-leave-active {
  opacity: 0;

}
/* .pageTransition-leave-actiev {

} */
</style>
<style lang='scss'>
@import "~element-ui/packages/theme-chalk/src/index";
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
