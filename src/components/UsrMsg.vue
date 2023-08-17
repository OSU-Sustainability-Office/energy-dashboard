<template>
  <div class="hello">
    <button @click="toggleFlag" class="toggleButton">{{ flag ? 'Hide Building Menu' : 'Show Building Menu' }}</button>
  </div>
</template>

<script>
import { EventBus } from '../event-bus'

export default {
  name: 'UsrMsg',
  data () {
    return {
      flag: true
    }
  },
  methods: {
    toggleFlag: function () {
      this.flag = !this.flag
      EventBus.$emit( 'inputData', this.flag )
    }
  }
}
</script>

<style scoped lang="scss">
.toggleButton {
  cursor: pointer;
}
</style>
