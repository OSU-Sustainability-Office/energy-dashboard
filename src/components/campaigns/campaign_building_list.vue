<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-09T13:21:44-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-11T09:19:09-08:00
-->
<template>
  <el-col :span='24' class='buildingContainer'>
    <el-row class='title'>
      <el-col :span='24'>
        Leaderboard
      </el-col>
    </el-row>
    <el-row class='buildingScroll' v-loading='!loaded' element-loading-background="rgba(0, 0, 0, 0.8)">
      <el-row class='buildingRow' v-if='!loaded'>
        &nbsp;
      </el-row>
      <el-row class='buildingRow' v-for='block in blocks' :key='block.path' ref='buildingRows'>
        <el-col v-if='loaded' :class='[(value === block.path) ? "buildingCol selected" : "buildingCol"]' :span='24'>
          <div :class='[(value === block.path) ? "outerClip selected" : "outerClip"]'>
            <div v-if = "!isNaN(accumulatedPercentage(block.path))" :class='[(value === block.path) ? "innerClip selected" : "innerClip"]' :style='`background-color:${ computedColor(block.path) };`' @click='buildingClick(block.path)'>
              <i class="fas fa-trophy" v-if='place(block.path) <= 3 && place(block.path) >= 1'><span :class='[(value === block.path) ? "innerTrophy selected" : "innerTrophy"]'>{{ place(block.path) }}</span></i> {{ block.name }}
              {{ ((accumulatedPercentage(block.path) > 0) ? '+' : '') + (Math.round(100 * accumulatedPercentage(block.path)) / 100).toString() + '%' }}
            </div>

            <!-- Display "No Data" on block, remove button functionality of block if NaN percentage detected-->
            <div v-else :class='[(value === block.path) ? "innerClip selected" : "innerClipNoData"]' :style='`background-color:${ computedColor(block.path) };`'>
              <i class="fas fa-trophy" v-if='place(block.path) <= 3 && place(block.path) >= 1'><span :class='[(value === block.path) ? "innerTrophy selected" : "innerTrophy"]'>{{ place(block.path) }}</span></i> {{ block.name }}- No Data
            </div>
          </div>
        </el-col>
      </el-row>
    </el-row>
  </el-col>
</template>
<script>
export default {
  props: ['path', 'loaded', 'value'],
  data () {
    return {
      activePath: null
    }
  },
  mounted () {
    if (this.path) {
      this.$emit('input', this.path + '/block_default')
    }
  },
  computed: {
    blocks: {
      get () {
        let blocks = this.$store.getters[this.path + '/blocks']
        if (!blocks) {
          return []
        }
        blocks.sort((a, b) => {
          try {
            const aPercentage = this.accumulatedPercentage(a.path)
            const bPercentage = this.accumulatedPercentage(b.path)
            if (aPercentage > bPercentage) {
              return 1
            } else {
              return -1
            }
          } catch (error) {
            return 1
          }
        })

        // Sort blocks with NaN percentages (no data) to the bottom
        blocks.sort((a, b) => {
          try {
            const aPercentage = this.accumulatedPercentage(a.path)
            const bPercentage = this.accumulatedPercentage(b.path)
            if (isNaN(aPercentage) && !isNaN(bPercentage)) {
              return 1
            } else if (isNaN(aPercentage) || isNaN(bPercentage)) {
              return -1
            } else {
              return 1
            }
          } catch (error) {
            return 1
          }
        })
        return blocks
      }
    }
  },
  methods: {
    buildingClick: function (building) {
      if (this.value === building) {
        this.$emit('input', this.path + '/block_default')
      } else {
        this.$emit('input', building)
      }
    },
    accumulatedPercentage: function (path) {
      if (this.$store.getters[path + '/modifierData']) {
        return this.$store.getters[path + '/modifierData']('campaign_linebar').accumulatedPercentage
      }
      return undefined
    },
    place: function (path) {
      return this.blocks.map(b => b.path).indexOf(path) + 1
    },
    computedColor: function (path) {
      if (!this.$store.getters[path + '/modifierData']('campaign_linebar')) return
      const percentage = this.accumulatedPercentage(path)
      // #d62326 - Bottom Red
      // #19a23a - Top Green
      const redInt = [parseInt('0xd6', 16), parseInt('0x23', 16), parseInt('0x26', 16)]
      const greenInt = [parseInt('0x19', 16), parseInt('0xa2', 16), parseInt('0x3a', 16)]
      const typicalColor = [redInt[0] - greenInt[0], greenInt[1] - redInt[1], greenInt[2] - redInt[2]]
      const compare = Math.abs(percentage) / 7.5
      const result = []

      if (percentage < -7.5) {
        result.push(greenInt[0])
        result.push(greenInt[1])
        result.push(greenInt[2])
      } else if (percentage > 7.5) {
        result.push(redInt[0])
        result.push(redInt[1])
        result.push(redInt[2])
      } else if (percentage < 0) {
        result.push(Math.round(typicalColor[0] - redInt[0] * compare))
        result.push(Math.round(typicalColor[1] + redInt[1] * compare))
        result.push(Math.round(typicalColor[2] + redInt[2] * compare))
      } else if (isNaN(percentage)) {
        result.push(greenInt[0])
        result.push(greenInt[0])
        result.push(greenInt[0])
      } else {
        result.push(Math.round(typicalColor[0] + greenInt[0] * (compare)))
        result.push(Math.round(typicalColor[1] - greenInt[1] * (compare)))
        result.push(Math.round(typicalColor[2] - greenInt[2] * (compare)))
      }
      return 'rgb(' + result[0].toString() + ',' + result[1].toString() + ',' + result[2].toString() + ')'
    }
  }
}
</script>
<style scoped lang='scss'>
  .title {
    font-size: 34px;
    color: $--color-white;
    font-family: "StratumNo2";
    text-align: left;
    padding-bottom: 1em;
  }
  .buildingContainer {
    background-color: $--color-black;
    border-radius: 5px;
    padding: 1em;
  }
  .buildingScroll {
    overflow-y: scroll;
    height: calc(100% - 5em);
    border-radius: 5px;
  }
  .buildingRow {
    padding: 0.5em;
    padding-right: 1em;
  }
  .buildingCol {
    font-size: 24px;
    color: $--color-white;
    font-family: "StratumNo2";
    cursor: pointer;
  }
  .buildingCol.selected {
    color: $--color-primary;
  }
  .buildingCol:hover .innerClip:not(.selected) {
    background-color: $--color-black !important;
  }
  $clippath: polygon(2.5% 0%, 0% 100%, 97.5% 100%, 100% 0%);
  .outerClip {
    padding: 0.05em;
    background-color: $--color-white;
    clip-path: $clippath;
  }
  .outerClip.selected {
    background-color: $--color-white;
  }
  .innerClip {
    padding: 0.5em;
    padding-left: 1em;
    clip-path: $clippath;
  }
  .innerClipNoData {
    padding: 0.5em;
    padding-left: 1em;
    clip-path: $clippath;
    cursor: auto;
  }
  .innerClip.selected {
    background-color: $--color-white !important;
  }
  .fa-trophy {
    position: relative;
  }
  .innerTrophy {
    position: absolute;
    z-index: 100;
    top: 1px;
    left: 0;
    width: 100%;
    text-align: center;
    font-size: 16px;
    color: $--color-primary;
    font-family: "StratumNo2";
  }
  .innerTrophy.selected {
    color: $--color-white;
  }
</style>
