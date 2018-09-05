<template>
<div class="flexFeature" v-bind:class="{ minimized : isMinimized }" ref="feature" :key='update'>
  <!-- <transition-group name="cardEntry" tag="div" class="flexFeature" v-bind:class="{ minimized : isMinimized }" ref="feature"> -->
    <card v-for="(card, index) in story.blocks" v-bind:key="index" v-bind:class="[index === 0 ? 'fullWidth' : '']" v-bind:index="index" :featured="true" ref="displayedCards"/>

    <div class="addFeatured" v-if='user.id === story.user_id' key="add" @click="addFeature()" v-bind:class="[isFull() ? 'fullAdd' : 'smallAdd']">
      +
    </div>
  <!-- </transition-group> -->
</div>
</template>

<script>
import card from '@/components/account/card'
import { mapGetters } from 'vuex'

export default {
  name: 'featured',
  components: {
    card
  },
  props: ['cards', 'fromMap'],
  data () {
    return {
      isMinimized: false,
      update: 0
    }
  },
  computed: {
    ...mapGetters([
      'user',
      'story'
    ])
  },
  methods: {
    updateCards: function () {
      if (this.$refs.displayedCards && this.$refs.displayedCards.length > 1) {
        for (let card of this.$refs.displayedCards) {
          card.$refs.chartController.parse()
        }
      }
    },
    isFull: function () {
      if (this.story.blocks.length === 0) {
        return true
      }
      return (this.story.blocks.length % 2 === 1)
    },
    addFeature: function () {
      var card = {}
      card.name = 'New Chart'
      card.date_start = '2018-06-01T00:00:00.000Z'
      card.date_end = '2018-06-30T23:59:00.000Z'
      card.date_interval = 15
      card.interval_unit = 'minute'
      card.graph_type = 1
      card.story_id = this.story.id
      card.index = this.story.blocks.length
      card.id = null
      // Default chart is the MU
      card.charts = [{
        name: 'New Chart',
        group_id: 9,
        point: 'accumulated_real',
        meters: [
          { meter_id: 8, operation: 1 },
          { meter_id: 9, operation: 1 }
        ]
      }]
      this.$store.dispatch('block', card).then(() => this.$store.commit('modifyFlag'))
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
.fullWidth {
  width: 100% !important;
  flex-basis: 100% !important;
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
