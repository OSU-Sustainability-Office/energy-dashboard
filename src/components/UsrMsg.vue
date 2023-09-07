<template>
  <div class="hello">
    <button @click="toggleFlag" class="toggleButton">{{ buttonText }}</button>
  </div>
</template>

<script>
import { EventBus } from '../event-bus'

export default {
  name: 'UsrMsg',
  data () {
    return {
      flag: true,
      flag2: false
    }
  },
  computed: {
    isSmallScreen () {
      return window.innerWidth < 844 // Adjust this threshold as needed
    },
    buttonText () {
      return this.isSmallScreen
        ? this.flag2
          ? 'Hide Building Menu'
          : 'Show Building Menu'
        : this.flag
          ? 'Hide Building Menu'
          : 'Show Building Menu'
    }
  },
  methods: {
    toggleFlag: function () {
      if ( this.isSmallScreen ) {
        this.flag2 = !this.flag2
        EventBus.$emit( 'inputData', this.flag2 )
      } else {
        this.flag = !this.flag
        EventBus.$emit( 'inputData', this.flag )
      }
    }
  }
}
</script>

<style scoped lang="scss">
.toggleButton {
  cursor: pointer;
  font-size: 14px;
}
</style>
