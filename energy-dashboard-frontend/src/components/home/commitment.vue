<template>
  <transition name='fade'>
    <span v-if="seen"> {{ c }} </span>
  </transition>
</template>

<script>
export default {
  name: 'commitment',
  data () {
    return {
      c: 'Education'
    }
  },
  methods: {
    updateC: function () {
      var commitments = [
        'Education',
        'Research',
        'Assessment',
        'Renewable Energy',
        'Carbon Neutrality'
      ]
      for (var c in commitments) {
        this.c = commitments[c]
      }
    }
  },
  mounted () {
    this.updateC()
  }
}
</script>

<style>
.fade-enter-active, .fade-leave-active {
  transition: opacity .5s;
}
.fade-enter, .fade-leave-to /* .fade-leave-active below version 2.1.8 */ {
  opacity: 0;
}
</style>
