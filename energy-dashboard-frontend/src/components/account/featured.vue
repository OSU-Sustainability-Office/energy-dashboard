<template>
  <div class="flex" v-bind:class="{ minimized : isMinimized }">
    <card v-for="card in cards" :title=card.title :desc=card.desc />
  </div>
</template>

<script>
import card from '@/components/account/card'

export default {
  name: 'featured',
  components: {
    card
  },
  data () {
    return {
      isMinimized: false,
      cards: [
        {
          title: 'card1',
          desc: 'This is a description.'
        },
        {
          title: 'card2',
          desc: 'This is a description.'
        },
        {
          title: 'card3',
          desc: 'This is a description.'
        },
        {
          title: 'card4',
          desc: 'This is a description.'
        },
        {
          title: 'card5',
          desc: 'This is a description.'
        },
        {
          title: 'card3',
          desc: 'This is a description.'
        },
        {
          title: 'card3',
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
.minimized {

}
.card {
  margin-right: 1em;
  border: 3px solid #000;
  height: 15em;
  min-width: 15em;
}
</style>
