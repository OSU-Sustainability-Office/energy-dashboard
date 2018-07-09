<template>
  <div class="background">
    <!-- <span class="main-heading">Stories</span> -->
    <carousel v-bind:cards="cards" />
    <!-- <span class="main-heading">Featured Blocks</span> -->
    <featured v-bind:cards="cardsFeatured" ref='featureBox' />
  </div>
</template>

<script>
import carousel from '@/components/account/carousel'
import featured from '@/components/account/featured'
import axios from 'axios';

export default {
  name: 'account',
  components: {
    carousel,
    featured
  },
  props: [],
  data() {
    return {
      cards: [],
      cardsFeatured: [],
    }
  },
  created() {
     axios.get('http://localhost:3000/api/getStoriesForUser?id=1').then (res => {
       this.cards = res.data;
     }).catch (e => {
      this.errors.push(e);
     });


  },
  watch: {
    cards: function(value) {
      for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[i].featured) {
          axios.get('http://localhost:3000/api/getBlocksForStory?id=1').then (res => {
            this.cardsFeatured = res.data;
          });
          return;
        }
      }
    }
  },
  methods: {
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.background {
  background: #fff;
  top: 4em;
  bottom: 0px;
  position: absolute;
  width: 100%;
  padding: 1em;
}
.main-heading {
  font-size: 3em;
  margin-left: .3em;
}
</style>
