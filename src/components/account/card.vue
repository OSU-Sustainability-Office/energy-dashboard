<template>
  <div class="card featured" v-bind:class="{ feature : featured}" ref='card'>
    <div class='titleTextFeatured row' ref='title'>
      <div class='col'>{{block(index).name}}</div>
      <i class="col-1 text-right fas fa-sliders-h" @click='$parent.editModal(index)' v-b-tooltip.hover title='Change Parameters'></i>
    </div>
    <!-- <div class='titleTextFeatured' v-if="story.public">
      {{block(index).name}}

    </div> -->
    <chartController :index='index' :graphType='block(index).graph_type' ref="chartController"  class="chart" :styleC='style' :height='this.chartHeight()'/>
    <!-- <featureController :index='index' v-if="featured" ref="featureController" /> -->
  </div>
</template>

<script>

import chartController from '@/components/charts/chartController'
import featureController from '@/components/account/featureController'
import { mapGetters } from 'vuex'

export default {
  name: 'card',
  props: ['index', 'featured'],
  components: {
    chartController, featureController
  },
  data () {
    return {
      editcard: false,
      tempName: '',
      interval: 15,
      interval_unit: 'minute',
      date_start: '',
      date_end: '',
      graphtype: 1,
      style: {
        'display': 'inline-block',
        'width': '100%',
        'height': '56%',
        'padding-right': '0.5em',
        'padding-left': '0.5em',
        'padding-top': '1em'
      }
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block'
    ]),
    intunit: {
      // 1 15 Minutes
      // 2 1 hour
      // 3 1 Day
      // 4 1 week
      // 5 1 month
      get: function () {
        if (this.interval === 15 && this.interval_unit === 'minute') {
          return 1
        } else if (this.interval === 1 && this.interval_unit === 'hour') {
          return 2
        } else if (this.interval === 1 && this.interval_unit === 'day') {
          return 3
        } else if (this.interval === 7 && this.interval_unit === 'day') {
          return 4
        } else if (this.interval === 1 && this.interval_unit === 'month') {
          return 5
        }
      },
      set: function (v) {
        switch (v) {
          case 1:
            this.interval = 15
            this.interval_unit = 'minute'
            break
          case 2:
            this.interval = 1
            this.interval_unit = 'hour'
            break
          case 3:
            this.interval = 1
            this.interval_unit = 'day'
            break
          case 4:
            this.interval = 7
            this.interval_unit = 'day'
            break
          case 5:
            this.interval = 1
            this.interval_unit = 'month'
            break
        }
      }
    }
  },
  methods: {
    cardSave: async function () {
      this.editcard = false
      let charts = await this.$refs.featureController.saveCharts()
      let block = {
        name: this.tempName,
        index: this.index,
        date_interval: this.interval,
        interval_unit: this.interval_unit,
        date_start: this.date_start,
        date_end: this.date_end,
        graph_type: this.graphtype,
        charts: charts
      }
      this.$store.dispatch('block', block).then(() => {
        this.$refs.chartController.parse()
      })
    },
    cardDelete: function () {
      this.editcard = false
      this.$store.commit('removeBlock', { index: this.index })
      this.$eventHub.$emit('reloadCharts')
      this.$store.commit('modifyFlag')
    },
    chartHeight: function () {
      // 200 for padding (large over estimate) ~16:9 aspect ratio
      return (window.innerWidth - 200) * 9 / 16
    }
  },
  watch: {
    editcard: function (v) {
      if (v) {
        this.tempName = this.block(this.index).name
        this.interval = this.block(this.index).date_interval
        this.interval_unit = this.block(this.index).interval_unit
        this.date_start = this.block(this.index).date_start
        this.date_end = this.block(this.index).date_end
        this.graphtype = this.block(this.index).graph_type
      }
    }
  },
  mounted () {
    this.$nextTick(() => {
      this.$refs.chartController.chart.$data._chart.canvas.style.height = this.chartHeight().toString() + 'px'
      window.addEventListener('resize', () => {
        this.$refs.chartController.chart.$data._chart.canvas.style.height = this.chartHeight().toString() + 'px'
      })
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>

@media (min-width: 425px){
  .card {
    margin-left: 0.5%;
    margin-right: 0.5%;
  }
  .feature {
    padding-right: 2em;
    padding-left: 2em;
  }
  .titleTextFeatured {
    font-size: 2em;
    padding-top: 0.3em;
  }
}
@media (min-width: 800px){
  .card {
    margin-left: 4em;
    margin-right: 4em;
  }
}
@media (max-width: 425px){
  .card {
    margin-left: 0px;
    margin-right: 0px;
  }
  .feature {
    padding-right: 0.3em;
    padding-left: 0.3em;
  }
  .titleTextFeatured {
    font-size: 1.1em;
    padding-top: 0.1em;
  }
  .fas {
    padding-right: 2.2em;
    padding-top: 0.2em;
  }
}
.feature {
  background: #000;
  width: 100%;
  flex: 1 1 49%;
}
.card {
  margin-top: 1em;
  border: 2px solid #000;
  border-radius: 5px;
  overflow: hidden;
}

.col {
  margin: 0em;
}

.titleTextFeatured {
  color: rgb(215,63,9);
  font-family: 'StratumNo2';
}
.descriptionTextFeatured {
  color: rgb(255,255,255);

}
.fas {
  color: #FFFFFF99;
  padding-top: 0.2em;
  font-size: 0.9em;
  width: 100%;
  cursor: pointer;
}
.fas:hover {
  color: rgba(215,63,9, 0.8);
}
.storyName {
  color:rgb(215,63,9);
  font-family: 'StratumNo2';
  font-size: 1.8em;
  display: block;
}
.storyCard {
  padding: 1em;
  border: 2.5px solid rgb(215,63,9);
  height: 100%;
  width: 100%;
}
.storyDescription {
  color: #FFF;
  font-family: 'StratumNo2';
  font-size: 1.2em;
  display: block;
  padding-left: 0.3em;
}
.top-pad {
  padding-top: 0.5em;
}
</style>
