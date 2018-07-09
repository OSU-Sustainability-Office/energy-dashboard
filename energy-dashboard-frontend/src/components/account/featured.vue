<template>
<div class="flexFeature" v-bind:class="{ minimized : isMinimized }">
  <card v-for="card in cards" :featured="true" :name='card.name' :description='card.descr' :id='card.id' :start='card.date_start' :end='card.date_end' :type='card.graph_type' :unit='card.interval_unit' :int='card.date_interval' :media='card.media' ref="displayedCards"/>
  <div class="addFeatured" @click="addFeature()" >
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
      var card = {};
      card.featured = true;
      card.name = "New Chart";
      card.date_start = "2018-06-01T00:00:00.000Z";
      card.date_end = "2018-06-30T23:59:00.000Z";
      card.date_interval = 15;
      card.interval_unit = "minute";
      card.graph_type = 1;

      this.cards.push(card);
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flexFeature {
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  padding-left: 1em;
  padding-right: 1em;
  padding-top: 1em;
  padding-bottom: 1em;
  width: 100%;
}

.addFeatured {
  font-size: 4em;
  color: rgb(215,63,9);
  height: 10em;
  flex: 0 60px;
  line-height: 10em;
}
.minimized {}
</style>
