<template>
  <div>
    <div class="flex" v-bind:class="{ maximized : isMaximized }">
      <card v-for="card in cards" v-if="!card.featured" :featured=false :name="card.name" :description="card.description" />
    </div>
    <center><div id="expand" v-on:click="isMaximized = !isMaximized"><i class="fas" v-bind:class="{ 'fa-chevron-circle-down' : !isMaximized, 'fa-chevron-circle-up' : isMaximized }"></i></div></center>

  </div>
</template>

<script>
import card from '@/components/account/card'
import axios from 'axios';
export default {
  name: 'carousel',
  props: ['cards'],
  components: {
    card
  },
  data () {


    return {
      isMaximized: false,
    }
  },
  created () {

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
  margin-right: 5em;
  margin-left: 1em;
  padding-top: 1em;
  padding-bottom: 1em;
  height: auto;
  -webkit-transition: height 2s;
  transition: flex-wrap 2s ease-in-out;

}
.maximized {
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
#expand {
  font-size: 2em;
  z-index: 1000;
  top: 11em;
  left: 49%;
  margin: 0;
  padding: 0;
}
#expand:hover {
  cursor: pointer;
  color: #D73F09;
}
.slide-enter, .slide-leave-to{
  transform: scaleY(0)
}
.slide-enter-active, .slide-leave-active{
  transition: transform 0.5s ease-in-out;
}
</style>
