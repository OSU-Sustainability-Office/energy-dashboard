<template>
  <div class="app">
    <navigbar />
      <transition v-bind:name="transitionName">
        <router-view />
      </transition>
  </div>
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
    src: url( process.env.BASE + '/static/fonts/StratumNo2-Bold.woff2') format('woff2'),
        url( process.env.BASE + '/static/fonts/StratumNo2-Bold.woff') format('woff'),
        url( process.env.BASE + '/static/fonts/StratumNo2-Bold.ttf') format('truetype'),
        url( process.env.BASE + '/static/fonts/StratumNo2-Bold.svg#StratumNo2-Bold') format('svg');
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
}
.pageFrom-leave-active {
  transform: scale(0.5);
}
.pageFrom-enter, .pageFrom-leave-active {
  opacity: 0;

}
/* .pageTransition-leave-actiev {

} */
.dropdown-item:active {
  background-color: #D73F09;
}
.dropdown-item:active > * {
  color: #FFF;
}
.btn-primary {
  background-color: #D73F09 !important;
  color: #FFFFFF;
  border: solid 1px #FFF !important;
}
.btn-primary:hover {
  background-color: #C72F09 !important;
  color: #FFFFFF;
  border: solid 1px #CCC !important;
}
.btn-primary:active {
  background-color: #d76740 !important;
  color: #FFFFFF;
  border: solid 1px #CCC !important;
}

.btn-secondary {
  background-color: #262626 !important;
  color: #FFFFFF;
  border: solid 1px #FFF;
}
.btn-secondary:hover {
  background-color: #000000 !important;
  color: #FFFFFF;
  border: solid 1px #CCC !important;
}
.btn-secondary:active {
  background-color: #303030 !important;
  color: #FFFFFF;
  border: solid 1px #CCC !important;
}

.btn-danger {
  background-color: #d50510 !important;
  color: #FFFFFF;
  border: solid 1px #FFF;
}
.btn-danger:hover {
  background-color: #ad040d !important;
  color: #FFFFFF;
  border: solid 1px #CCC !important;
}
.btn-danger:active {
  background-color: #c3050f !important;
  color: #FFFFFF;
  border: solid 1px #CCC !important;
}
</style>

<style scoped>

</style>
