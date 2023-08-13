<template>
  <div>
    <li v-for="(message, index) in messageList" :item="message" :key="index">
      {{ message }}
    </li>
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
      messageList: []
    }
  },
  created () {
    EventBus.$on( 'inputData', inputWord => {
      this.messageList.push( inputWord )
    } )
  }
}
</script>
