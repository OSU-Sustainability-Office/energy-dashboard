<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-20T10:38:57-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-03-11T13:01:28-07:00
-->

<template>
  <el-row class='stage'>
    <el-row class='main'>
      <el-row class="title">
        <el-col :span='23'>{{ building.name }}</el-col>
        <el-col :span='1' class='close-box'><i class="fas fa-times" @click="hide()"></i></el-col>
      </el-row>
      <el-row>
        <el-col :span='24' v-loading='building ? false : true'>
          <div class="media" ref='media'></div>
        </el-col>
      </el-row>
      <el-row class="graphcontrol">
        <el-col :span='24'>
          <el-col :span='24' class='buttonContainer'>
            <switchButtons :blocks='buildingBlocks' />
          </el-col>
          <el-row class='graphslide'>
            <i class="left fas fa-angle-left" @click='prev()' ref="prevArrow"></i>
            <i class="right fas fa-angle-right" @click='next()' ref="nextArrow"></i>
          </el-row>
          <el-row type='flex' class="graph" ref='scrollBox'>
            <el-col class='inline' v-for='block in buildingBlocks' :key='block.id' :span='24' ref='slidingBox'>
              <chartController :path='block.path' ref="chartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': 'calc(100% - 20px)','height': '100%', 'margin-right': '10px', 'margin-left': '10px' }" :height='200'/>
            </el-col>
          </el-row>
          <el-row class="buttons">
            <el-col :span='12'>
              <el-button class='bigButton' @click="$emit('startCompare', building.id)">Compare</el-button>
            </el-col>
            <el-col :span='12'>
              <el-button class='bigButton' @click='$router.push({path: `/building/${building.id}/${currentRange}`})'>View Full Graph</el-button>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-row>
  </el-row>
</template>
<script>
import chartController from '@/components/charts/chartController'
import switchButtons from '@/components/map/time_switch_buttons_big'

export default {
  name: 'sideView',
  props: [],
  components: {
    chartController, switchButtons
  },
  data () {
    return {
      api: process.env.VUE_APP_ROOT_API,
      title: '',
      currentRange: 1,
      unit: 'day',
      int: 1,
      index: 0

    }
  },
  computed: {

    media: {
      get () {
        return this.building.image
      }
    },

    buildingBlocks: {
      get () {
        return this.$store.getters[this.building.path + '/blocks']
      }
    },

    building: {
      get () {
        return this.$store.getters['map/building'](this.$store.getters['modalController/data'].id)
      }
    }
  },
  methods: {
    hide: function () {
      this.$emit('hide')
    },
    next: function () {
      if (this.index + 1 >= this.buildingBlocks.length) { return }
      this.index++
    },
    prev: function () {
      if (this.index - 1 < 0) { return }
      this.index--
    }
  },
  watch: {
    // media: function (value) {
    //   this.$refs.media.style.backgroundImage = 'url(' + this.api + '/image?name=' + value + ')'
    // },
    building: {
      immediate: true,
      handler: async function (value) {
        this.index = 0
        for (let block of this.buildingBlocks) {
          await this.$store.dispatch(block.path + '/resetDefault')
          // this.$store.dispatch(block.path + '/getData')
        }
        this.$refs.prevArrow.style.display = 'none'
        if (this.buildingBlocks.length > 1) {
          this.$refs.nextArrow.style.display = 'block'
        } else {
          this.$refs.nextArrow.style.display = 'none'
        }
        this.$refs.media.style.backgroundImage = 'url(' + this.api + '/image?name=' + this.media + ')'
      }
    },
    index: function (to, from) {
      this.$refs.scrollBox.$children.forEach((child) => {
        child.$el.style.transform = 'translateX(' + (-1 * this.index * (this.$refs.scrollBox.$el.clientWidth + 20)).toString() + 'px)'
      })
      if (to < from) {
        if (this.index <= 0) {
          this.$refs.prevArrow.style.display = 'none'
        }
        if (this.buildingBlocks.length > 1) {
          this.$refs.nextArrow.style.display = 'block'
        }
      } else {
        if (this.index + 1 === this.buildingBlocks.length) {
          this.$refs.nextArrow.style.display = 'none'
        }
        if (this.buildingBlocks.length > 1) {
          this.$refs.prevArrow.style.display = 'block'
        }
      }
    }
  },
  async mounted () {
    // for (let block of this.buildingBlocks) {
    //   await this.$store.dispatch(block.path + '/removeAllModifiers')
    // }
    // this.$refs.prevArrow.style.display = 'none'
    // if (this.buildingBlocks.length <= 1) {
    //   this.$refs.nextArrow.style.display = 'none'
    // } else {
    //   this.$refs.nextArrow.style.display = 'block'
    // }
    // this.$refs.media.style.backgroundImage = 'url(' + this.api + '/image?name=' + this.media + ')'
  }
}
</script>
<style scoped lang='scss'>
.stage {
  z-index: 401;
  display: block;
  position: absolute;
  left: 100%;
  top: 15%;
  width: 450px !important;
  margin-left: -470px;
  height: 85% !important;

}
.main {
  padding: 0;
  border-radius: 5px;
  overflow: hidden;
  background-color: rgb(26,26,26);
  box-shadow: -1px 1px 6px rgba(0,0,0,0.6);
}
.title {
  padding: 0.3em;
  padding-left: 0.8em;
  padding-right: 0.8em;
  font-size: 32px;
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
  padding-bottom: 1em;
}
.inline {
  margin-right: 20px;
  transition: transform 1s;
  display: inline-block;
  flex-shrink: 0;
}

.graphslide {
  position: absolute;
  color: rgba($--color-white, 0.4);
  bottom: 220px;
  font-size: 3em;
  width: 100%;
  left: 0;
  z-index: 4;
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
