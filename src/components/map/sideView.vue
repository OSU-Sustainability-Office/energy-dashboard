<template>
  <el-container class='stage'>
    <el-main class='main'>
      <el-row class="title">
        <el-col :span='23'>{{ story.name }}</el-col>
        <el-col :span='1' class='close-box'><i class="fas fa-times" @click="hide()"></i></el-col>
      </el-row>
      <el-row>
        <el-col :span='24'>
          <div class="media" ref='media'></div>
        </el-col>
      </el-row>
      <el-row class="graphcontrol">
        <el-col :span='24'>
          <el-row class="buttons">
            <el-col :span='8' class='rangeButtonParent'>
              <el-button class='rangeButton' @click='currentRange = 0' v-bind:class="{ active: currentRange == 0 }">Week</el-button>
            </el-col>
            <el-col :span='8' class='rangeButtonParent'>
              <el-button class='rangeButton' @click='currentRange = 1' v-bind:class="{ active: currentRange == 1 }">Month</el-button>
            </el-col>
            <el-col :span='8' class='rangeButtonParent'>
              <el-button class='rangeButton' @click='currentRange = 2' v-bind:class="{ active: currentRange == 2 }">Year</el-button>
            </el-col>
          </el-row>
          <el-row class='graphslide'>
            <i class="left fas fa-angle-left" @click='prev()' ref="prevArrow"></i>
            <i class="right fas fa-angle-right" @click='next()' ref="nextArrow"></i>
          </el-row>
          <el-row type='flex' class="graph" ref='scrollBox'>
            <el-col class='inline' v-for='(block,index) in story.blocks' :key='index' :span='24'>
              <chartController :randomColors=1 :graphType='1' :index=index ref="chartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': 'calc(100% - 20px)','height': '100%', 'margin-right': '10px', 'margin-left': '10px' }" :height='200'/>
            </el-col>
          </el-row>
          <el-row class="buttons">
            <el-col :span='12'>
              <el-button class='bigButton' @click="$emit('startCompare')">Compare</el-button>
            </el-col>
            <el-col :span='12'>
              <el-button class='bigButton' @click='$router.push({path: `/public/${storyId}/${currentRange}`})'>View Full Graph</el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-main>
  </el-container>
</template>
<script>
import chartController from '@/components/charts/chartController'
import { mapGetters } from 'vuex'

export default {
  name: 'sideView',
  props: ['storyId'],
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
      this.$emit('hide')
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
      this.$refs.scrollBox.$children.forEach((child, index) => {
        child.$el.style.transform = 'translateX(' + (-1 * this.index * (this.$refs.scrollBox.$el.clientWidth + 20)).toString() + 'px)'
      })
      this.$refs.prevArrow.style.display = 'block'
      if (this.index + 1 === this.story.blocks.length) {
        this.$refs.nextArrow.style.display = 'none'
      }
    },
    prev: function () {
      if (this.index - 1 < 0) { return }
      this.index--
      this.$refs.scrollBox.$children.forEach(child => {
        child.$el.style.transform = 'translateX(' + (-1 * this.index * (this.$refs.scrollBox.$el.clientWidth + 20)).toString() + 'px)'
      })
      this.$refs.nextArrow.style.display = 'block'
      if (this.index <= 0) {
        this.$refs.prevArrow.style.display = 'none'
      }
    }
  },
  watch: {
    media: function (value) {
      this.$refs.media.style.backgroundImage = 'url(' + this.api + '/energy/images/' + value + ')'
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
    this.$refs.prevArrow.style.display = 'none'
    this.$store.dispatch('story', this.storyId).then(() => {
      let promises = []
      if (this.story.blocks.length <= 1) {
        this.$refs.nextArrow.style.display = 'none'
      } else {
        this.$refs.nextArrow.style.display = 'block'
      }
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
  }
}
</script>
<style scoped lang='scss'>
@import '@/assets/style-variables.scss';

.stage {
  z-index: 401;
  display: block;
  position: absolute;
  left: 100%;
  top: 15%;
  width: 450px;
  margin-left: -470px;
  height: 85%;
}
.main {
  padding: 0;
  background-color: rgb(26,26,26);
  box-shadow: -1px 1px 6px rgba(0,0,0,0.6);
}
.title {
  padding: 0.3em;
  padding-left: 0.8em;
  padding-right: 0.8em;
  font-size: 3.2ch;
  height: auto;
  background-color: rgb(215,63,9);
  color: #FFF;
  font-family: 'StratumNo2';
  border-bottom: solid 1px #fff;
}
.close-box {
  cursor: pointer;
}
.media {
  height: 200px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-bottom: solid 1px #fff;
}
.graphcontrol {
  padding: 1.5em;
}
.buttons {
  padding-bottom: 1.5em;
}

.rangeButtonParent {
  padding: 0.2em;
}
.rangeButton {
  background-color: $--color-black;
  color: darken($--color-white, 30%);
  border-color: darken($--color-white, 30%);
  width: 100%;
}
.rangeButton:not(.active):hover {
  background-color: #000;//darken($--color-primary, 10%);
  color: $--color-white;
  border-color: $--color-white;
}
.rangeButton.active {
  background-color: $--color-primary;
  color: $--color-white;
  border-color: $--color-white;
}
.rangeButton.active:hover {
  background-color: $--color-primary;
  color: $--color-white;
  border-color: $--color-white;
}

.graph {
  width: 100%;
  overflow: hidden;
}
.inline {
  margin-right: 20px;
  transition: transform 1s;
  display: inline-block;
  float: left;
}

.graphslide {
  position: absolute;
  color: rgba($--color-white, 0.4);
  top: 155px;
  font-size: 3em;
  width: 100%;
  left: 0;
}
.graphslide > * {
  cursor: pointer;
}
.graphslide > *:hover {
  color: $--color-white;
}
.graphslide .right {
  position: absolute;
  right: 8px;
}
.graphslide .left {
  position: absolute;
  left: 8px;
}
.buttons > * {
  text-align: center;
}
.bigButton {
  background-color: $--color-black;
  color: darken($--color-white, 30%);
  border-color: darken($--color-white, 30%);
  width: 98%;
}
.bigButton:hover {
  background-color: #000;
  color: $--color-white;
  border-color: $--color-white;
}
.bigButton:active {
  background-color: $--color-black;
  color: $--color-white;
  border-color: $--color-white;
}
</style>
