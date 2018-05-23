<template>
  <transition name='fade'>
    <span>{{ commitments[i] }}</span>
  </transition>
</template>

<script>
export default {
  name: 'commitment',
  data () {
    return {
      i: 0,
      commitments: [
        'Education',
        'Community Engagement',
        'Carbon Planning',
        'Outreach',
        'Research',
        'Alternative Fuels',
        'Emissions Reduction',
        'Smart Metering',
        'Assessment',
        'Renewable Energy',
        'Carbon Neutrality'
      ]
    }
  },
  mounted () {
    var timeout = 150;
    var i = 0
    while (i < this.commitments.length - 1) {
      setTimeout (() => {
        this.i++
      }, timeout)
      timeout += (100 + 25 * i)
      i++
    }
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
