<template>
  <div class="background">
    <!-- <span class="main-heading">Stories</span> -->
    <carousel v-bind:cards="cards" />
    <!-- <span class="main-heading">Featured Blocks</span> -->
    <featured v-bind:cards="cards"/>
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
      cards: {},
      cardsFeatured: {}
    }
  },
  created() {
     axios.get('http://localhost:3000/api/getStoriesForUser?id=1').then (res => {
       this.cards = res.data;
     }).catch (e => {
      this.errors.push(e);
     });
  }
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
}
.main-heading {
  font-size: 3em;
  margin-left: .3em;
}
</style>
