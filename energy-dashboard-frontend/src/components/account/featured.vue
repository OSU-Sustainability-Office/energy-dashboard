<template>
<div class="flex" v-bind:class="{ minimized : isMinimized }">
  <card v-for="card in cards" :isFeatured=true :name=card.name :description=card.description />
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
          name: 'card0',
          description: 'This is a description.',
          isFeatured: true
        },
        {
          name: 'card0code',
          description: 'This is a description.',
          isFeatured: true
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
  overflow-y: hidden;
  margin-right: 5em;
  margin-left: 1em;
  padding-top: 1em;
  padding-bottom: 1em;
  
}

.minimized {}
</style>
