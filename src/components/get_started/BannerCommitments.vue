<!--
  Filename: BannerCommitments.vue
  Description: Used in conjunction with the GetStartedBanner.vue component to display
  a list of commitments sequentially.
-->
<template>
  <transition name="fade">
    <span class="message" :key="keyValue">{{ capatilize(commitments[i]) }}</span>
  </transition>
</template>

<script>
export default {
  name: 'BannerCommitments',
  data() {
    return {
      i: 0,
      keyValue: false,
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
  mounted() {
    var timeout = 100
    var i = 0
    while (i < this.commitments.length - 1) {
      setTimeout(() => {
        this.i++
        this.keyValue = !this.keyValue
      }, timeout)
      timeout += 90 * i
      i++
    }
  },
  methods: {
    capatilize(val) {
      return val.toUpperCase()
    }
  }
}
</script>

<style scoped>
.message {
  position: absolute;
  transition: all 0.5s;
  opacity: 1;
  transition-property: opacity, transform;
}
.fade-enter {
  opacity: 0;
  transform: translateY(60px);
}
.fade-leave-to {
  opacity: 0;
  transform: translateY(-60px);
}
</style>
