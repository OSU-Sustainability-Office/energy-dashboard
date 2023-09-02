<!--
  Filename: App.vue
  Info: Root vue component.
-->

<template>
  <el-container class="app">
    <!--Nav bar -->
    <el-header class="header">
      <navigbar />
    </el-header>
    <!--Page Content (handled by vue-router)-->
    <el-main class="main" ref="main">
      <router-view />
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
  async created () {
    // On load, grab building/meter/map information from the API.
    await this.$store.dispatch( 'map/loadMap' )
    // Also check if user is logged in.
    this.$store.dispatch( 'user/user' )
  },
  data () {
    return {
      transitionName: 'pageTo'
    }
  },
  beforeDestroy () {},
  methods: {
    disableScroll: function () {
      this.$refs.main.$el.style.overflow = 'hidden'
    },
    enableScroll: function () {
      this.$refs.main.$el.style.overflow = 'auto'
    }
  },
  mounted () {
    // This is the first-timer pop-up window
    if ( !document.cookie.split( ';' ).some( cookieString => cookieString.includes( 'firstTimer' ) ) ) {
      this.$msgbox( {
        title: 'First Timer?',
        message: 'Take a look at the "Get Started" tab to learn more and for FAQ\'s!',
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Never Show This Message Again',
        distinguishCancelAndClose: true,
        callback: function ( action ) {
          if ( action === 'cancel' ) {
            const cookieDate = new Date()
            cookieDate.setFullYear( new Date().getFullYear() + 10 )
            document.cookie = 'firstTimer=true; expires=' + cookieDate.toUTCString() + ';'
          }
        }
      } )
    }
  },
  watch: {
    $route: function ( to, from ) {
      // transition in
      if ( to.path.length > from.path.length ) {
        this.transitionName = 'pageTo'
      } else {
        // transition out
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
  src:
    url('/fonts/StratumNo2-Bold.woff2') format('woff2'),
    url('/fonts/StratumNo2-Bold.woff') format('woff'),
    url('/fonts/StratumNo2-Bold.ttf') format('truetype'),
    url('/fonts/StratumNo2-Bold.svg#StratumNo2-Bold') format('svg');
  font-weight: bold;
  font-style: normal;
}
@media only screen and (max-width: 844px) {
  .el-message-box {
    position: absolute !important;
    top: 30vh !important;
    left: 10vh !important;
  }
}
body {
  font-family: 'Open Sans', sans-serif;
  -webkit-font-smoothing: antialiased;
  -moz-osx-font-smoothing: grayscale;
}
.pageTo-enter-active,
.pageTo-leave-active {
  transition-property: opacity, transform;
  transition-duration: 1s;
}

.pageTo-enter {
  transform: scale(0.75);
  position: absolute;
  overflow: visible;
}
.pageTo-leave-active {
  transform: scale(2);
}
.pageTo-enter,
.pageTo-leave-active {
  opacity: 0;
}
.pageFrom-enter-active,
.pageFrom-leave-active {
  transition-property: opacity, transform;
  transition-duration: 1s;
}

.pageFrom-enter {
  transform: scale(2);
  position: absolute;
  overflow: visible;
}
.pageFrom-leave-active {
  transform: scale(0.75);
}
.pageFrom-enter,
.pageFrom-leave-active {
  opacity: 0;
}
</style>
<style lang="scss">
@import '~element-ui/packages/theme-chalk/src/index';
</style>

<style scoped lang="scss">
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
