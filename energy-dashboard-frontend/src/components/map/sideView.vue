<template>
  <div class="view container">
    <div class="title row">
      <span class="col">{{ story.name }}</span>
      <span class="col-1 text-right" ><i class="fas fa-times" @click="hide()"></i></span>
    </div>
    <div class="media row" ref='media'>
      <!-- <img v-if='media' :src='api+"block-media/thumbs/"+media' /> -->
    </div>
    <div class="graphcontrol container-fluid">
      <div class="buttons row">
        <button @click='currentRange = 0' class="col btn" v-bind:class="{ active: currentRange == 0 }">Week</button>
        <button @click='currentRange = 1' class="col btn" v-bind:class="{ active: currentRange == 1 }">Month</button>
        <button @click='currentRange = 2' class="col btn" v-bind:class="{ active: currentRange == 2 }">Year</button>
      </div>
      <div class="d-flex flex-row graph" ref='scrollBox'>
        <div class="col inline" v-for='(block,index) in story.blocks' :key='index'>
          <chartController :randomColors=1 :graphType='1' :index=index ref="chartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': '100%','height': '100%', 'padding': '0.5em' }"/>
        </div>
      </div>
      <i class="graphslide left fas fa-caret-left" @click='prev()' ref="prevArrow"></i>
      <i class="graphslide right fas fa-caret-right" @click='next()' ref="nextArrow"></i>
      <div class="buttons row">
        <button @click='$router.push({path: `/public/${$parent.openStory}/${currentRange}`})' class="col btn">View in Dashboard</button>
      </div>
    </div>
  </div>
</template>
<script>
import chartController from '@/components/charts/chartController'
import { mapGetters } from 'vuex'

export default {
  name: 'sideView',
  props: [],
  components: {
    chartController
  },
  data () {
    return {
      api: process.env.ROOT_API,
      title: '',
      media: '',
      currentRange: 1,
      unit: 'day',
      int: 1,
      index: 0

    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block'
    ])
  },
  methods: {
    hide: function () {
      this.$parent.showSide = false
    },
    dateOffset: function () {
      var d = new Date()
      if (this.currentRange === 0) {
        d.setDate(d.getDate() - 7)
      } else if (this.currentRange === 1) {
        d.setMonth(d.getMonth() - 1)
      } else if (this.currentRange === 2) {
        d.setYear(d.getYear() - 1)
      }
      return d.toISOString()
    },
    next: function () {
      if (this.index + 1 >= this.story.blocks.length) { return }
      this.index++
      this.$refs.scrollBox.childNodes.forEach((child, index) => {
        child.style.transform = 'translateX(' + (-1 * this.index * (this.$refs.scrollBox.clientWidth + 20)).toString() + 'px)'
      })
      this.$refs.prevArrow.style.opacity = 1
      if (this.index + 1 === this.story.blocks.length) {
        this.$refs.nextArrow.style.opacity = 0
      }
    },
    prev: function () {
      if (this.index - 1 < 0) { return }
      this.index--
      this.$refs.scrollBox.childNodes.forEach(child => {
        child.style.transform = 'translateX(' + (-1 * this.index * (this.$refs.scrollBox.clientWidth + 20)).toString() + 'px)'
      })
      this.$refs.nextArrow.style.opacity = 1
      if (this.index <= 0) {
        this.$refs.prevArrow.style.opacity = 0
      }
    }
  },
  watch: {
    media: function (value) {
      this.$refs.media.style.backgroundImage = 'url(' + this.api + 'block-media/thumbs/' + value + ')'
    },
    currentRange: function (value) {
      value = parseInt(value)
      let i = 0
      let u = 0
      if (value === 0) {
        i = 6
        u = 'hour'
      } else if (value === 1) {
        i = 1
        u = 'day'
      } else if (value === 2) {
        i = 15
        u = 'day'
      }
      let promises = []
      for (let b of this.$store.getters.story.blocks) {
        let c = {
          index: b.index,
          date_interval: i,
          interval_unit: u,
          date_start: this.dateOffset()
        }

        promises.push(this.$store.dispatch('block', c))
      }
      Promise.all(promises).then(() => {
        for (let controller of this.$refs.chartController) {
          controller.parseDataBarLine()
        }
      }).catch(e => {
        console.log(e.message)
      })
    }
  },
  mounted () {
    this.$store.dispatch('story', this.$parent.openStory).then(() => {
      let promises = []
      this.media = this.story.media
      for (let block in this.story.blocks) {
        promises.push(this.$store.dispatch('block', { index: block, date_start: this.dateOffset(), date_end: (new Date()).toISOString(), date_interval: 1, interval_unit: 'day' }))
      }

      Promise.all(promises).then(() => {
        for (let controller of this.$refs.chartController) {
          controller.parseDataBarLine()
        }
      })
    })
    this.$refs.prevArrow.style.opacity = 0
    if (this.story.length <= 1) {
      this.$refs.nextArrow.style.opacity = 0
    } else {
      this.$refs.nextArrow.style.opacity = 1
    }
  }
}
</script>
<style scoped>
  .view {
    position: absolute;
    left: 100%;
    top: 15%;
    width: 450px;
    padding-bottom: 2em;
    background-color: rgb(26,26,26);
    z-index: 401;
    margin-left: -470px;
    box-shadow: -1px 1px 6px rgba(0,0,0,0.6);
    display: block;
  }
  .media {
    height: 300px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }
  .chart {
    height: 200px;
    width: 100%;
    background-color: #000;
    margin-top: 0.5em;
    border-radius: 10px;
  }
  .row {
    margin-top: 0;
    margin-bottom: 0;
  }
  .graphcontrol {
    margin-top: 1em;
    position: relative;
  }
  .buttons > .col {

    width: 30%;
    margin-left: 1%;

  }
  .buttons {

    margin: 0.5em;
    padding-right: 0.5em;
    padding-left: 0.5em;

  }
  .btn {
    background-color: #000;
    color: #FFF;
    border: solid 1px #FFF;
  }
  .utilities .row {
    color: #FFF;
  }
  .utilities .row.head {
    margin-top: 1em;
    color: #FFF;
  }
  .row.head {
    font-size: 1.2em;
    border-bottom: 1px solid rgba(0,0,0,0.6);
  }
  .btn.active {
    background-color: rgb(215,63,9);
  }
  .title.row > * {
    padding: 0;
    margin: 0;
  }
  .title {
    font-size: 3ch;
    height: auto;
    background-color: rgb(215,63,9);
    color: #FFF;
    font-family: 'StratumNo2';
  }
  .title .col-1 {
    padding-top: 0.2em;
    padding-right: 0.5em;
  }
  .title .col {
    padding-top: 0.15em;
    padding-left: 0.5em;
  }
  .graph {
    overflow-x: hidden;
    overflow-y: hidden;
  }
  .d-flex {
    display: flex;
  }
  .inline {
    flex: 0 0 100%;
    padding: 0;
    margin-right: 20px;
    transition: transform 1s;
  }
  .graphslide {
    position: absolute;
    color: white;
    background-color: rgb(215,63,9);
    font-size: 2.5em;
    width: 1em;
    height: 1em;
    text-align: center;
    margin-top: calc(50% - 2em);
    top: 0px;
    border-radius: 1em;
    opacity: 1;
    z-index: 0;
  }
  .graphslide:hover {

  }

  .graphslide.right {
    right: -0.2em;
    padding-left:0.1em;
  }
  .graphslide.left {
    left: -0.2em;
    padding-right:0.1em;
  }

</style>
