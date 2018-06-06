<template>
<div class="flexFeature" v-bind:class="{ minimized : isMinimized }">
  <card v-for="card in cards" :featured=card.featured v-if="card.featured" :name=card.name :description=card.description />
</div>
</template>

<script>
import card from '@/components/account/card'

export default {
  name: 'featured',
  components: {
    card
  },
  props: ["cards"],
  data() {
    return {
      isMinimized: false
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flexFeature {
  display: flex;
  flex-wrap: nowrap;
  align-items: center;
  justify-content: flex-start;
  margin-right: 5em;
  margin-left: 1em;
  padding-top: 1em;
  padding-bottom: 1em;
}

.minimized {}
</style>
