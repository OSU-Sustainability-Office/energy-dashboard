<template>
  <transition name='fade'>
    <span class="message" :key="keyValue">{{ commitments[i] | capatilize }}</span>
  </transition>
</template>

<script>
export default {
  name: 'commitment',
  data () {
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
  mounted () {
    var timeout = 10
    var i = 0
    while (i < this.commitments.length - 1) {
      setTimeout(() => {
        this.i++
        this.keyValue = !this.keyValue
      }, timeout)
      timeout += (100 + 50 * i)
      i++
    }
  },
  filters: {
    capatilize: function (value) {
      return value.toUpperCase()
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
 .fade-leave-active, .fade-enter-active {
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
