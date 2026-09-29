<!--
  Filename: App.vue
  Info: Root vue component.
-->

<template>
  <el-container class="app">
    <!--Nav bar -->
    <el-header class="header">
      <NavigationBar />
    </el-header>
    <!--Page Content (handled by vue-router)-->
    <el-main class="main" ref="main">
      <router-view />
    </el-main>
    <!--Blocks on first visit until a campus is chosen; silent on every visit after-->
    <CampusModal />
  </el-container>
</template>

<script>
import NavigationBar from '@/components/ui/NavigationBar.vue'
import CampusModal from '@/components/ui/CampusModal.vue'
import { h } from 'vue'
import { ElMessageBox } from 'element-plus'

export default {
  name: 'App',
  components: {
    NavigationBar,
    CampusModal
  },
  async created() {
    // Restore the remembered campus first. It is synchronous, so the map and the
    // buildings list render the right campus immediately instead of flashing the
    // default, and the picker only opens for someone who has never chosen.
    this.$store.dispatch('campus/restore')
    // On load, grab building/meter/map information from the API.
    await this.$store.dispatch('map/loadMap')
  },
  data() {
    return {
      transitionName: 'pageTo',
      firstTimerShown: false
    }
  },
  computed: {
    campusChosen() {
      return this.$store.getters['campus/chosen']
    }
  },
  methods: {
    disableScroll: function () {
      this.$refs.main.$el.style.overflow = 'hidden'
    },
    enableScroll: function () {
      this.$refs.main.$el.style.overflow = 'auto'
    },
    showFirstTimerPrompt: function () {
      if (this.firstTimerShown) {
        return
      }
      if (document.cookie.split(';').some(cookieString => cookieString.includes('firstTimer'))) {
        return
      }
      this.firstTimerShown = true
      ElMessageBox({
        title: 'First Timer?',
        message: () =>
          h('div', [
            h('p', 'Take a look at the "FAQ" tab for some info on how to get started!'),
            h('div', { style: 'height: 8px' }),
            h(
              'i',
              { style: 'font-size: 0.8em; font-style: italic;' },
              'Loading the map for the first time may take a moment, but future load times will be faster.'
            )
          ]),
        showCancelButton: true,
        confirmButtonText: 'OK',
        cancelButtonText: 'Never Show This Message Again',
        distinguishCancelAndClose: true,
        callback: function (action) {
          if (action === 'cancel') {
            const cookieDate = new Date()
            cookieDate.setFullYear(new Date().getFullYear() + 10)
            document.cookie = 'firstTimer=true; expires=' + cookieDate.toUTCString() + ';'
          }
        }
      })
    }
  },
  mounted() {
    // The campus picker takes precedence. Stacking both on a first visit buries
    // one behind the other for exactly the newcomer they are both aimed at, so
    // this waits for a campus and the watcher below picks it up.
    if (this.campusChosen) {
      this.showFirstTimerPrompt()
    }
  },
  watch: {
    campusChosen: function (chosen) {
      if (chosen) {
        this.showFirstTimerPrompt()
      }
    },
    $route: function (to, from) {
      // transition in
      if (to.path.length > from.path.length) {
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
@use 'element-plus/theme-chalk/src/index.scss';
</style>

<style scoped lang="scss">
/* Media query for mobile devices */
@media only screen and (max-width: 600px) {
  body {
    max-width: 100%;
    overflow-x: hidden; /* Hide horizontal scrollbar */
  }
}
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
  height: $nav-height;
  width: 100%;
  position: absolute;
  top: 0;
  left: 0;
}
.main {
  position: absolute;
  top: $nav-height;
  left: 0;
  min-height: calc(100% - #{$nav-height});
  margin: 0;
  padding: 0;
  width: 100%;
}
</style>
