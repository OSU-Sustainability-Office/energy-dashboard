<template>
<div class="flexFeature" v-bind:class="{ minimized : isMinimized }" ref="feature">
  <!-- <transition-group name="cardEntry"> -->
    <card v-for="(card, index) in cards" v-bind:key="index" :featured="true" :name='card.name' :description='card.descr' :id='card.id' :start='card.date_start' :end='card.date_end' :type='card.graph_type' :unit='card.interval_unit' :int='card.date_interval' :media='card.media' :story_id='card.story_id' ref="displayedCards"/>
  <!-- </transition-group> -->
  <div class="addFeatured" @click="addFeature()" >
    +
  </div>
</div>
</template>

<script>
import card from '@/components/account/card'
import Vue from 'vue'
import axios from 'axios';

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
    del: function(comp) {
//      this.$el.removeChild(comp.$el);

      for (var c in this.cards) {
        if (comp.id === this.cards[c].id) {
          var data = {'id':comp.id};
          axios('http://localhost:3000/api/deleteBlock',{method: "post",data:data, withCredentials:true}).catch(err=>{
            console.log(err);
          });

          this.cards.splice(c-1,1);

        }
      }
    },
    numberOfCards: function() {
      // var r = 0;
      // for (var i = 0; i < this.cards.length; i++)
      //   if (this.cards[i].featured)
      //     r++;
      return this.cards.length;
    },
    addFeature: function() {
      var card = {};
      card.featured = true;
      card.name = "New Chart";
      card.date_start = "2018-06-01T00:00:00.000Z";
      card.date_end = "2018-06-30T23:59:00.000Z";
      card.date_interval = 15;
      card.interval_unit = "minute";
      card.graph_type = 1;
      card.story_id = this.$parent.currentStory;

      this.cards.push(card);
    },
    reload: function() {
      this.$refs.displayedCards.forEach(card => {
        card.reload();
      });
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flexFeature {
  position: absolute;
  top: 250px;
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
.cardEntry-enter-active, .cardEntry-leave-active {
  transition-property: opacity, transform;
  transition-duration: 1s;
}

/* .page-enter-active {
  transition-delay: 1s;
} */
.cardEntry-enter {
  transform: translateX(1000px);
}
.cardEntry-leave-active {
  transform: translateX(-1000px);
}
.cardEntry-enter, .cardEntry-leave-active {
  opacity: 0;

}
.minimized {}
</style>
