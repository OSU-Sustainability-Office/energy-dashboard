<template>
<div class="flex" v-bind:class="{ minimized : isMinimized }">
  <card v-for="card in cards" :featured=true :title=card.title :desc=card.desc />
</div>
</template>

<script>
import card from '@/components/account/card'

export default {
  name: 'featured',
  components: {
    card
  },
  data() {
    return {
      isMinimized: false,
      cards: [{
          title: 'card0',
          desc: 'This is a description.'
        },
        {
          title: 'card0code',
          desc: 'This is a description.'
        },
        {
          title: 'card0',
          desc: 'This is a description.'
        },
        {
          title: 'card0',
          desc: 'This is a description.'
        },
        {
          title: 'card0',
          desc: 'This is a description.'
        },
        {
          title: 'card0',
          desc: 'This is a description.'
        },
        {
          title: 'card0',
          desc: 'This is a description.'
        }
      ]
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flex {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  overflow: scroll;
  overflow-y: hidden;
  margin-right: 1em;
  margin-left: 1em;
  padding-top: 1em;
  padding-bottom: 1em;
}

.minimized {}
</style>
