<template>
  <div>
    <li v-if="message === true">test</li>
  </div>
</template>

<script>
import { EventBus } from '../../event-bus'
export default {
  name: 'Results',
  props: {
    msg: {
      type: String
    }
  },
  data: function () {
    return {
      message: ''
    }
  },
  created () {
    EventBus.$on( 'inputData', inputWord => {
      this.message = inputWord
      console.log( this.message )
    } )
  }
}
</script>
