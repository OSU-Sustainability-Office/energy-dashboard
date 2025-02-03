<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-11T11:37:25-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-04-16T11:17:53-07:00
-->

<template>
  <el-col :span="24" class="reductionBody">
    <el-col :span="24" class="reductionBackground">
      <el-row class="title">
        <el-col :span="24"> Reducing your Usage </el-col>
      </el-row>
      <!-- <el-row class='reductionTimeLine'>
        <el-progress :percentage="50" :stroke-width="22" :show-text='false' class='bar'>
        </el-progress>
        <div class='ball'>
        </div>
        <div class='ball'>
        </div>
        <div class='ball'>
        </div>
        <div class='ball'>
        </div>
      </el-row> -->
      <el-row class="reductionGrid">
        <el-col class="gridCard" v-for="(tip, index) in tips" :key="index" :span="8">
          <div @mouseenter="hoverShow = index" @mouseleave="hoverShow = null" style="height: 100%">
            <el-col :span="24" class="gridCardOverlay">
              <img class="gridCardIcon" :src="getImageSrc(tip.icon)" alt="Icon" />
              <el-row class="gridCardTitle">
                {{ tip.title }}
              </el-row>
              <transition name="fade">
                <el-row class="gridCardDescription" v-if="hoverShow === index">
                  <ul>
                    <li v-for="l in tip.description" :key="l">{{ l }}</li>
                  </ul>
                </el-row>
              </transition>
            </el-col>
          </div>
        </el-col>
      </el-row>
    </el-col>
  </el-col>
</template>
<script>
export default {
  data () {
    return {
      hoverShow: null,
      tips: [
        {
          title: 'Lighting',
          description: [
            'Swap out an incandescent lamp for LED or CFL, or buy Energy Star rated lamps (for those lights without standard base).',
            'Use as much natural light as possible! Be diligent about turning off lights when they aren’t needed.',
            'Properly position lights to only illuminate necessary areas.'
          ],
          icon: 'lighting'
        },
        {
          title: 'Laundry',
          description: [
            'Only run full laundry loads.',
            'Wear clothes more than once before washing.',
            'Donate excess or unneeded clothing to a local shelter or thrift store.',
            'Clean the lint trap after every load.'
          ],
          icon: 'laundry'
        },
        {
          title: 'Community Spaces',
          description: [
            'Make sure your refrigerator door always closes completely and don’t hold it open for long.',
            'Hang out in common areas instead of your room. This allows you to turn off your lights and share with others (and build community).',
            'Use the microwave instead of the stovetop or oven.',
            'Ensure fridge coils (the warm parts) are clean of dust and that air can freely flow around.'
          ],
          icon: 'community_spaces'
        },
        {
          title: 'Unplug',
          description: [
            'Get rid of a mini-fridge or share with a neighbor.',
            'Use a powerstrip to shut off appliances and electronics when not in use.',
            'Take the stairs instead of the elevator.',
            'Use blankets/wear layers instead of opening heat vents/increasing the thermostat.',
            'Use energy star rated electronics, and use portable devices instead of desktop computers whenever possible.'
          ],
          icon: 'electricity'
        }
      ]
    }
  },
  methods: {
    getImageSrc (iconName) {
      return new URL(`../../assets/icons/${iconName}.svg`, import.meta.url).href
    }
  },
  created () {}
}
</script>
<style scoped lang="scss">
.reductionBody {
  padding-top: 2em;
}
.reductionBackground {
  border-radius: 5px;
  overflow: hidden;
}
.title {
  padding-left: 2em;
  color: $color-black;
  font-family: 'StratumNO2';
  font-size: 34px;
}
.reductionGrid {
  padding: 1em;
  padding-right: 2em;
  padding-left: 2em;
  flex-wrap: wrap;
  overflow-x: scroll;
}
.gridCard {
  height: 400px;
  border-radius: 5px;
  margin: 1em;
  overflow: hidden;
  flex: 0 0 calc(50% - 2em);
  background-color: #fcb248;
}

.gridCardTitle {
  color: $color-white;
  text-align: center;
  line-height: 28px;
  font-size: 28px;
  top: 18px;
  font-family: 'StratumNO2';
}
.gridCard:hover .gridCardTitle {
  color: $color-white;
}
.gridCardDescription {
  position: absolute;
  width: 100%;
  top: 50px;
  bottom: 50px;
  font-size: 18px;
  padding-left: 4em;
  padding-right: 4em;
  color: $color-white;
}
.reductionTimeLine {
  width: 100%;
  position: relative;
  padding: 2em;
}
.bar {
  position: relative;
  top: 0;
  left: 0;
  width: 100%;
  z-index: 0;
}
.ball {
  height: 30px;
  width: 30px;
  border-radius: 15px;
  background-color: #1a1a1a;
  position: relative;
  z-index: 100;
  display: inline-block;
  top: -26px;
}
.ball :nth-of-type(1) {
  left: 0;
}
.ball :nth-of-type(2) {
  left: 33%;
}
.ball :nth-of-type(3) {
  left: 66%;
}
.ball :nth-of-type(4) {
  left: 99%;
}
.gridCardOverlay {
  position: relative;
  background-color: rgba(255, 255, 255, 0);
  left: 0;
  width: 100%;
  height: 100%;
  // border-right: solid 2px $color-white;
  // clip-path: polygon(100% 0, 100% 80%, 80% 100%, 0 100%, 0 0);
  overflow: hidden;
  transition: background-color 0.45s;
}
.gridCard:hover .gridCardOverlay {
  background-color: rgba(0, 0, 0, 0.4);
}
.gridCardIcon {
  position: absolute;
  height: 75%;
  width: 75%;
  top: 12.5%;
  left: 12.5%;
  transition: opacity 0.4s;
}
.gridCard:hover .gridCardIcon {
  opacity: 0;
}

.fade-enter-active,
.fade-leave-active {
  transition: all 0.4s;
}
.fade-enter {
  opacity: 0;
}
.fade-enter-to {
  opacity: 1;
}
.fade-leave {
  opacity: 1;
}
.fade-leave-to {
  opacity: 0;
}
</style>
