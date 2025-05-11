<!--
  Filename: BuildingModal.vue
  Description: Modal component that appears when a building is clicked on the map. It shows
  the building's image, chart, and buttons for comparing buildings or viewing full graphs.
-->
<template>
  <el-row class="stage">
    <el-container class="main">
      <el-header class="title">
        <el-row>
          <el-col :span="23">{{ building.name }}</el-col>
          <el-col :span="1" class="close-box"><i class="fas fa-times" @click="hide()"></i></el-col>
        </el-row>
      </el-header>
      <el-row>
        <el-col :span="24" v-loading="building ? false : true">
          <div class="media" ref="media"></div>
        </el-col>
      </el-row>
      <el-main class="graphcontrol">
        <el-col :span="24">
          <el-col :span="24" class="buttonContainer">
            <TimeRangeSwitcher :blocks="buildingBlocks" :forceUpdate="false" ref="timeRangeSwitcher" />
          </el-col>
          <el-row class="graphslide">
            <i class="left fas fa-angle-left" @click="prev()" ref="prevArrow"></i>
            <i class="right fas fa-angle-right" @click="next()" ref="nextArrow"></i>
          </el-row>
          <el-carousel
            class="graph"
            trigger="click"
            arrow="never"
            indicatorPosition="none"
            :autoplay="false"
            ref="carousel"
          >
            <el-carousel-item v-for="block in buildingBlocks" :key="block.id + 2" ref="slidingBox">
              <ChartController
                :path="block.path"
                ref="ChartController"
                class="chart"
                :styleC="chartStyleObj"
                :height="250"
                :invertColors="true"
              />
            </el-carousel-item>
          </el-carousel>
          <el-row class="buttons">
            <el-col :span="12">
              <el-button class="bigButton" @click="$emit('startCompare', building.id)">Compare</el-button>
            </el-col>
            <el-col :span="12">
              <el-button
                class="bigButton"
                @click="
                  $router.push({
                    path: `/building/${building.id}/${currentRange + 1}`
                  })
                "
                >View Full Graph</el-button
              >
            </el-col>
          </el-row>
        </el-col>
      </el-main>
    </el-container>
  </el-row>
</template>

<script>
import ChartController from '@/components/charts/ChartController.vue'
import TimeRangeSwitcher from '@/components/ui/TimeRangeSwitcher.vue'

export default {
  name: 'BuildingModal',
  props: {},
  components: {
    ChartController,
    TimeRangeSwitcher
  },
  data () {
    return {
      api: import.meta.env.VITE_ROOT_API,
      title: '',
      unit: 'day',
      int: 1,
      index: 0,
      chartStyleObj: {
        display: 'inline-block',
        width: 'calc(100% - 20px)',
        height: '100%',
        'margin-right': '10px',
        'margin-left': '10px'
      }
    }
  },
  computed: {
    currentRange: {
      get () {
        return this.$refs.timeRangeSwitcher.currentRange
      }
    },

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
      if (this.index + 1 >= this.buildingBlocks.length) {
        return
      }
      this.index++
      this.$refs.carousel.next()
    },
    prev: function () {
      if (this.index - 1 < 0) {
        return
      }
      this.index--
      this.$refs.carousel.prev()
    }
  },
  watch: {
    building: {
      immediate: true,
      handler: async function (value) {
        this.index = 0
        for (let block of this.buildingBlocks) {
          await this.$store.dispatch(block.path + '/resetDefault')
          let blockpath = block.path
          let searchTerm = 'block_'
          let chartIndex = blockpath.indexOf(searchTerm)
          let blockID = blockpath.slice(chartIndex + searchTerm.length)
          this.$store.commit(blockpath + '/chart_' + blockID + '/resetMultTimeStamps')
        }
        this.$refs.prevArrow.style.display = 'none'
        if (this.buildingBlocks.length > 1) {
          this.$refs.nextArrow.style.display = 'block'
        } else {
          this.$refs.nextArrow.style.display = 'none'
        }
        if (this.media) {
          this.$refs.media.style.backgroundImage =
            'url("https://osu-energy-images.s3-us-west-2.amazonaws.com/thumbnails/' + this.media + '")'
        }
      }
    },
    index: function (to, from) {
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
  }
}
</script>
<style scoped lang="scss">
.stage {
  z-index: 401;
  display: block;
  position: absolute;
  bottom: 14%;
  left: 29.5%;
  width: 420px !important;
  height: 85% !important;
}
.main {
  padding: 0;
  border-radius: 5px;
  overflow: hidden;
  background-color: rgb(26, 26, 26);
  box-shadow: -1px 1px 6px rgba(0, 0, 0, 0.6);
}
.title {
  padding: 0.3em;
  padding-left: 0.8em;
  padding-right: 0.8em;
  font-size: 32px;
  height: auto;
  background-color: rgb(215, 63, 9);
  color: #fff;
  font-family: 'StratumNo2';
  border-bottom: solid 1px #fff;
  text-align: center; // might as well center this for the big screen version too
}
.close-box {
  cursor: pointer;
}
.media {
  height: 150px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  border-bottom: solid 1px #fff;
}
.graphcontrol {
  padding: 1em;
  overflow-x: hidden;
}
.graph {
  width: 100%;
  overflow: hidden;
  padding-bottom: 1em;
  height: 250px;
}
.inline {
  margin-right: 20px;
  transition: transform 1s;
  display: inline-block;
  flex-shrink: 0;
}
.graphslide {
  position: absolute;
  color: rgba($color-white, 0.4);
  top: 380px;
  font-size: 3em;
  width: 100%;
  left: 0;
  z-index: 4;
}
.graphslide > * {
  cursor: pointer;
}
.graphslide > *:hover {
  color: $color-white;
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
  background-color: $color-black;
  color: color.adjust($color-white, $lightness: -30%);
  border-color: color.adjust($color-white, $lightness: -30%);
  width: 98%;
  font-size: 16px;
  font-weight: 700;
  padding: 20px 12px;
}
.bigButton:hover {
  background-color: #000;
  color: $color-white;
  border-color: $color-white;
}
.bigButton:active {
  background-color: $color-black;
  color: $color-white;
  border-color: $color-white;
}
.buttonContainer {
  height: 60px; // reduce padding above top buttons (week / 60 days /year)
}
</style>
