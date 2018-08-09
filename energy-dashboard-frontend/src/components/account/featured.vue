<template>
<div class="flexFeature" v-bind:class="{ minimized : isMinimized }" ref="feature">
  <!-- <transition-group name="cardEntry" tag="div" class="flexFeature" v-bind:class="{ minimized : isMinimized }" ref="feature"> -->
    <card v-for="(card, index) in cards" v-bind:key="index+card.id" v-bind:index="index" :featured="true" v-bind:name='card.name' v-bind:description='card.descr' v-bind:id='card.id' v-bind:start='card.date_start' v-bind:end='card.date_end' v-bind:type='card.graph_type' v-bind:unit='card.interval_unit' v-bind:int='card.date_interval' v-bind:media='card.media' v-bind:story_id='card.story_id' v-bind:points='card.points' v-bind:names='card.names' v-bind:groups='card.groups' v-bind:meters='card.meters' ref="displayedCards"/>

    <div class="addFeatured" v-if='!fromMap' key="add" @click="addFeature()" v-bind:class="[isFull() ? 'fullAdd' : 'smallAdd']">
      +
    </div>
  <!-- </transition-group> -->
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
  props: ["cards","fromMap"],
  data() {
    return {
      isMinimized: false,
    }
  },
  methods: {
    del: function(comp) {
//      this.$el.removeChild(comp.$el);
        var data = {'id':this.cards[comp].id};
        axios(process.env.ROOT_API+'api/deleteBlock',{method: "post",data:data, withCredentials:true}).then(() => {
          this.cards.splice(comp,1);
        }).catch(err=>{
          console.log(err);
        });

    },
    numberOfCards: function() {
      // var r = 0;
      // for (var i = 0; i < this.cards.length; i++)
      //   if (this.cards[i].featured)
      //     r++;
      return this.cards.length;
    },
    isFull: function() {
      return (this.cards.length % 2 === 0);
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
      // this.$nextTick(() => {
      //   this.$refs.displayedCards[this.cards.length-1].save();
      // });
    },
    reload: function() {
      // this.$refs.displayedCards.forEach(card => {
      //   card.reload();
      // });
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
  width: calc(100% - 2em);
}

.addFeatured {
  font-size: 4em;
  color: rgb(215,63,9);
  height: 10em;
  flex: 0 60px;
  line-height: 9.8em;
  margin-top: 0.2em;
  margin-right: 0.2em;
  margin-left: 0.2em;
  border: solid 2px #000;
  border-radius: 7px;
}
.fullAdd {
  border-left: none;
  border-radius: 0px 7px 7px 0px;
}
.smallAdd {

  border-right: none;
  border-radius: 7px 0px 0px 7px;
}
.cardEntry-enter-active, .cardEntry-leave-active {
  transition-property: opacity, transform, width;
  transition-duration: 1s;
  backface-visibility: hidden;
}
.cardEntry-leave-active {
  position: relative;
}

/* .page-enter-active {
  transition-delay: 1s;
} */
.cardEntry-enter {
  transform: translateX(1000px);
  opacity: 1;
}
.cardEntry-leave-to {
  transform: translateX(-1000px);
  opacity: 0;
}
.minimized {}
</style>
