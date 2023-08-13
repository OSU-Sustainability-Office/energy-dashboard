<template>
  <div class="hello">
    <button @click="toggleFlag">{{ flag ? 'True' : 'False' }}</button>
  </div>
</template>

<script>
import { EventBus } from '../event-bus'

export default {
  name: 'UsrMsg',
  data () {
    return {
      flag: false
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
