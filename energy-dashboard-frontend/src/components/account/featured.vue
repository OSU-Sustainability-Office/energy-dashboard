<template>
<div class="flexFeature" v-bind:class="{ minimized : isMinimized }">
  <card v-for="card in cards" :featured="true" :name='card.name' :description='card.descr' :id='card.id' :start='card.date_start' :end='card.date_end' :type='card.graph_type' :unit='card.interval_unit' :int='card.date_interval' :media='card.media' ref="displayedCards"/>
  <div class="addFeatured" v-if="numberOfCards() < 2" @click="addFeature()" >
    +
  </div>
</div>
</template>

<script>
import card from '@/components/account/card'
import Vue from 'vue'

export default {
  name: 'featured',
  components: {
    card
  },
  props: ["cards"],
  data() {
    return {
      isMinimized: false,
    }
  },
  methods: {
    numberOfCards: function() {
      // var r = 0;
      // for (var i = 0; i < this.cards.length; i++)
      //   if (this.cards[i].featured)
      //     r++;
      return this.cards.length;
    },
    addFeature() {
      var componentClass = Vue.extend(card);
      var card = new componentClass();
      card.featured = true;
      this.cards.push(card);
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
  margin-left: 1em;
  padding-top: 1em;
  padding-bottom: 1em;
}
.addFeatured {
  font-size: 4em;
  color: rgb(215,63,9);
  height: 100%;
  width: 100px;
}
.minimized {}
</style>
