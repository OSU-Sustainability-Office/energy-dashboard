<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-03T12:39:57-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-31T13:32:37-08:00
-->

<template>
  <el-row class="stage_compareside">
    <el-col :span="24" class="innerContent">
      <el-row class="title">
        <el-col :span="22">
          <span>{{ name }} </span>
        </el-col>
        <div class="close-box"><i class="fas fa-times" @click="$emit('hide')"></i></div>
      </el-row>
      <el-row class="pics" v-loading="mediaArray.length < 0" element-loading-background="rgba(0, 0, 0, 0.8)">
        <el-col :span="24" class="nowrap">
          <div
            v-for="(media, index) in mediaArray"
            :class="classForIndex(index)"
            :style="`background-image:url(https://osu-energy-images.s3-us-west-2.amazonaws.com/thumbnails/${media}); width:calc(${
              100 / mediaArray.length
            }% + ${index === 0 ? '22.5px' : '55px'});`"
            :key="media"
          ></div>
        </el-col>
      </el-row>
      <switchButtons :blocks="[block]" ref="switcher" />
      <el-row class="grid">
        <el-col :span="24">
          <chartController
            v-if="block"
            :path="block.path"
            ref="lineChartController"
            class="chart"
            :styleC="{
              display: 'inline-block',
              width: 'calc(100% - 20px)',
              height: '100%',
              'margin-right': '10px',
              'margin-left': '10px'
            }"
            :height="225"
            :invertColors="true"
          />
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="20" :offset="2" class="buttonParent">
          <el-button
            class="bigButton"
            @click="
              $router.push({
                path: `/compare/${encodeURI(JSON.stringify(buildings.map(o => o.id)))}/${
                  $refs.switcher.currentRange + 1
                }`
              })
            "
            >View Full Graph</el-button
          >
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
import chartController from '@/components/charts/chartController'
import switchButtons from '@/components/map/time_switch_buttons_big'

export default {
  components: {
    chartController,
    switchButtons
  },
  props: [],
  data () {
    return {
      api: process.env.VUE_APP_ROOT_API
    }
  },
  computed: {
    path: {
      get () {
        return this.$store.getters['modalController/data'].path
      }
    },
    block: {
      get () {
        let mgId = this.$store.getters[this.path + '/primaryGroup']('Electricity').id
        return this.$store.getters[this.path + '/block'](mgId)
      }
    },
    name: {
      get () {
        if (!this.buildings) return
        let names = this.buildings.map(building => this.$store.getters[building.path + '/name'])
        let r = ''
        for (let index in names) {
          if (index > 0) {
            r += ' vs '
          }
          r += names[index]
        }
        return r
      }
    },
    buildings: {
      get () {
        if (!this.block) return
        let buildingIds = this.$store.getters[this.block.path + '/modifierData']('building_compare').buildingIds
        return buildingIds.map(id => this.$store.getters['map/building'](id))
      }
    },
    buildingBlocks: {
      get () {
        let buildingBlockArray = []
        for (let i in this.buildings) {
          // Use spread syntax (...) to create an array of objects, instead of 2d array
          buildingBlockArray.push(...this.$store.getters[this.buildings[i].path + '/blocks'])
        }
        return buildingBlockArray
      }
    },
    mediaArray: {
      get () {
        if (!this.buildings) return
        let buildingImages = this.buildings.map(building => this.$store.getters[building.path + '/image'])
        while (buildingImages.length > 4) buildingImages.pop()
        return buildingImages
      }
    }
  },
  created () {
    // if (this.block) {
    //   console.log('creates')
    //   console.log(this.block)
    // }
  },
  methods: {
    dateOffset: function () {
      var d = new Date()
      if (this.currentRange === 0) {
        d.setDate(d.getDate() - 7)
      } else if (this.currentRange === 1) {
        d.setMonth(d.getMonth() - 1)
      } else if (this.currentRange === 2) {
        d.setFullYear(d.getFullYear() - 1)
      }
      return d.toISOString()
    },
    update: function () {
      this.$refs.lineChartController.parse()
    },
    classForIndex: function (index) {
      if (this.mediaArray.length === 1) {
        return 'slantImage unCut'
      } else if (index === 0) {
        return 'slantImage leftEnd'
      } else if (index + 1 === this.mediaArray.length || index >= 3) {
        return 'slantImage rightEnd'
      } else {
        return 'slantImage'
      }
    }
  },
  // Refer to "buildings" and "buildingBlocks" in "computed" section above
  // Use buildings > blocks > charts as far as global vuex store getter calls
  watch: {
    buildings: {
      immediate: true,
      handler: async function (value) {
        for (let buildingBlock of this.buildingBlocks) {
          let blockpath = buildingBlock.path
          let searchTerm = 'block_'
          let chartIndex = blockpath.indexOf(searchTerm)
          let blockID = blockpath.slice(chartIndex + searchTerm.length)
          this.$store.commit(blockpath + '/chart_' + blockID + '/resetMultTimeStamps')
        }
      }
    }
  }
}
</script>
<style lang="scss" scoped>
.stage_compareside {
  position: absolute;
  top: 0;
  left: 29.5%;
  width: 420px;
  z-index: 401;
  padding-top: 10px;
}
.innerContent {
  position: relative;
  background-color: $--color-black;
  height: 100%;
  width: 100%;
  border-radius: 5px;
  overflow: hidden;
}
.title {
  background-color: $--color-primary;
  height: 60px;
  color: $--color-white;
  border-bottom: solid 1px $--color-white;
  font-size: 26px;
  font-family: 'StratumNo2';
  padding-top: 17px;
  padding-left: 20px;
  position: relative;
  top: 0;
  left: 0;
}
.title > .el-col {
  overflow: hidden;
  white-space: nowrap;
  text-overflow: ellipsis;
  padding-right: 10px;
}
.close-box {
  cursor: pointer;
}
.pics {
  border-bottom: solid 1px $--color-white;
}
$slope: 160px / 4;
$border-width: 3px;
.nowrap {
  white-space: nowrap;
  overflow: hidden;
  height: 160px !important;
  background-color: $--color-white;
}
.slantImage {
  height: 100%;
  position: relative;
  top: 0;
  display: inline-block;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  clip-path: polygon(0% 100%, $slope 0%, 100% 0%, calc(100% - #{$slope}) 100%);
}
.slantImage:nth-child(1) {
  left: 0px;
}
.slantImage:nth-child(2) {
  left: -1 * $slope + $border-width;
}
.slantImage:nth-child(3) {
  left: -2 * $slope + 2 * $border-width;
}
.slantImage:nth-child(4) {
  left: -3 * $slope + 3 * $border-width;
}
.slantImage.rightEnd {
  clip-path: polygon(0% 100%, $slope 0%, 100% 0%, 100% 100%);
}
.slantImage.leftEnd {
  clip-path: polygon(0% 100%, 0% 0%, 100% 0%, calc(100% - #{$slope}) 100%);
}
.slantImage.unCut {
  clip-path: polygon(0% 100%, 0% 0%, 100% 0%, 100% 100%);
}
.buttons {
  padding: 1em;
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
  background-color: #000; //darken($--color-primary, 10%);
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
.bigButton {
  background-color: $--color-black;
  color: darken($--color-white, 30%);
  border-color: darken($--color-white, 30%);
  width: 98%;
  margin-bottom: 1em;
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
.buttonParent {
  padding: 1em;
}
</style>
