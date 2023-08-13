<template>
  <div class="hello">
    <input placeholder="Enter Text Here" v-model="tempMessage" @keyup.enter="submit" />
  </div>
</template>

<script>
import { EventBus } from '../event-bus'

export default {
  name: 'UsrMsg',
  data () {
    return {
      tempMessage: ''
    }
  },
  methods: {
    submit: function () {
      EventBus.$emit( 'inputData', this.tempMessage )
      this.tempMessage = ''
    }
  }
}
</script>
