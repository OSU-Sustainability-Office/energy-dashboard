<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-11T11:37:25-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-14T11:05:48-08:00
-->

<template>
  <el-col :span='24' class='reductionBody'>
    <svg height='0' width='0'>
      <defs>
        <clipPath id='lightbulb'>
          <path class="st0" d="M-256,264.9c-1,0-2-0.3-2.8-0.8c-2-1.3-2.8-4-1.9-6.2l28.4-68.7l-14,0c-2.3,0-4.3-1.4-5.2-3.4
          c-0.9-2.1-0.4-4.5,1.2-6.1l84.5-84.9c1.7-1.7,4.4-2,6.4-0.7c2,1.3,2.8,3.9,1.9,6.2v0l-27.4,68.4l12.3,0c2.3,0,4.3,1.3,5.2,3.4
          c0.9,2.1,0.4,4.5-1.2,6.1l-83.8,85.3C-253.3,264.4-254.6,264.9-256,264.9z M-258.7,257.1C-258.7,257.1-258.7,257.1-258.7,257.1
          L-258.7,257.1z M-238,180.2l10.6,0c1.9,0,3.7,1,4.8,2.6c1.1,1.6,1.3,3.6,0.5,5.4l-22.6,54.6l64-65.1l-8.9,0c-1.9,0-3.7-0.9-4.8-2.5
          c-1.1-1.6-1.3-3.6-0.6-5.4l22.1-55L-238,180.2z M-161.6,98.5L-161.6,98.5L-161.6,98.5z M-165.7,96.8
          C-165.7,96.9-165.7,96.9-165.7,96.8L-165.7,96.8L-165.7,96.8z"/>
          <path class="st2" d="M-224.9,30h-53.4c-4.4,0-7.9-3.6-7.9-8.1v-54.3c0-19.6,15.5-35.6,34.6-35.7l0,0h0c9.2,0,17.9,3.7,24.5,10.3
          c6.5,6.7,10.1,15.6,10.1,25v54.5C-217,26.4-220.6,30-224.9,30z M-277.9,21.5h52.5v-54.1c0-7.2-2.7-13.9-7.7-19
          c-5-5.1-11.6-7.9-18.6-7.9h0l0,0c-14.5,0-26.2,12.2-26.2,27.1V21.5z"/>
        </clipPath>
        <clipPath id="triangle" clipPathUnits="objectBoundingBox">
            <polygon points="0.25 0.8, 0.5 0.4, 0.5 0.4, 0.75 0.8" />
        </clipPath>
        <clipPath id='lightning'>
          <path class="st0" d="M203,285.9c-1,0-2-0.3-2.8-0.8c-2-1.3-2.8-4-1.9-6.2l28.4-68.7l-14,0c-2.3,0-4.3-1.4-5.2-3.4
          c-0.9-2.1-0.4-4.5,1.2-6.1l84.5-84.9c1.7-1.7,4.4-2,6.4-0.7c2,1.3,2.8,3.9,1.9,6.2v0l-27.4,68.4l12.3,0c2.3,0,4.3,1.3,5.2,3.4
          s0.4,4.5-1.2,6.1l-83.8,85.3C205.7,285.4,204.4,285.9,203,285.9z M200.3,278.1C200.3,278.1,200.3,278.1,200.3,278.1L200.3,278.1z
          M221,201.2l10.6,0c1.9,0,3.7,1,4.8,2.6c1.1,1.6,1.3,3.6,0.5,5.4l-22.6,54.6l64-65.1l-8.9,0c-1.9,0-3.7-0.9-4.8-2.5
          c-1.1-1.6-1.3-3.6-0.6-5.4l22.1-55L221,201.2z M297.4,119.5L297.4,119.5L297.4,119.5z M293.3,117.8
          C293.3,117.9,293.3,117.9,293.3,117.8L293.3,117.8L293.3,117.8z"/>
        </clipPath>
      </defs>
    </svg>
    <el-col :span='24' class='reductionBackground'>
      <el-row class='title'>
        <el-col :span='24'>
          Reducing Your Usage
        </el-col>
      </el-row>
      <el-row class='reductionGrid' type='flex'>
        <el-col class='gridCard' v-for='(tip, index) in tips' :key='index' :span='8' :style='"background-image:" + gradients[index % gradients.length] + ";"' >
          <div @mouseenter='hoverShow = index' @mouseleave='hoverShow = null' style='height: 100%;'>
            <el-col :span='24' class='gridCardOverlay'>
              <div class='gridCardIcon' :style='"clip-path: url(#" + tip.icon + ");" + "background-image:" + gradients[index % gradients.length] + ";"'>
              </div>
              <el-row class='gridCardTitle'>
                {{ tip.title }}
              </el-row>
              <el-row class='gridCardDescription' v-if='hoverShow === index'>
                <ul>
                  <li v-for='l in tip.description' :key='l'> {{ l }}</li>
                </ul>
              </el-row>
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
      gradients: [
        'linear-gradient(to bottom right, #8455A3, #4D59A7)',
        'linear-gradient(to bottom right, #EC2149, #CA4C9C)',
        'linear-gradient(to bottom right, #12BBCE, #5CBC68)',
        'linear-gradient(to bottom right, #F47422, #FDD900)'
      ],
      tips: [
        {
          title: 'Lighting',
          description: [
            'Swap out an incandescent lamp for LED or CFL, or buy Energy Star rated lamps (for those lights without standard base).',
            'Use as much natural light as possible! Be diligent about turning off lights when they aren’t needed.',
            'Properly position lights to only illuminate necessary areas.'
          ],
          icon: 'lightning'
        },
        {
          title: 'Laundry',
          description: [
            'Only run full laundry loads.',
            'Wear clothes more than once before washing.',
            'Donate excess or unneeded clothing to a local shelter or thrift store.',
            'Clean the lint trap after every load.'
          ],
          icon: 'lightning'
        },
        {
          title: 'Community Spaces',
          description: [
            'Make sure your refrigerator door always closes completely and don’t hold it open for long .',
            'Hang out in common areas instead of your room. This allows you to turn off your lights and share with others (and build community).',
            'Use the microwave instead of the stovetop or oven.',
            'Ensure fridge coils (the warm parts) are clean of dust and that air can freely flow around.'
          ],
          icon: 'lightning'
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
          icon: 'lightning'
        }
      ]
    }
  },
  created () {
    // DurstenFeld Shuffle
    for (var i = this.gradients.length - 1; i > 0; i--) {
      var j = Math.floor(Math.random() * (i + 1))
      var temp = this.gradients[i]
      this.gradients[i] = this.gradients[j]
      this.gradients[j] = temp
    }
  }
}
</script>
<style scoped lang='scss'>
.reductionBody {
  padding: 2em;
}
.reductionBackground {
  background-color: $--color-black;
  border-radius: 5px;
  overflow: hidden;
  padding: 2em;
}
.title {
  color: $--color-white;
  font-family: "StratumNO2";
  font-size: 34px;
  padding-bottom: 1em;
}
.reductionGrid{
  padding: 1em;
  overflow-x: scroll;
}
.gridCard {
  height: 400px;
  border-radius: 5px;
  margin-right: 1em;
  overflow: hidden;
  flex: 0 0 500px;
}

.gridCardTitle {
  color: $--color-white;
  text-align: center;
  line-height: 28px;
  font-size: 28px;
  top: 18px;
  font-family: 'StratumNO2';
}
.gridCard:hover .gridCardTitle {
  color: $--color-white;
}
.gridCardDescription {
  position: absolute;
  width: 100%;
  top: 50px;
  bottom: 50px;
  font-size: 18px;
  padding-left: 4em;
  padding-right: 4em;
  color: $--color-white;
}
.gridCardOverlay {
  position: relative;
  background-color: rgba(255,255,255, 0.35);
  left: 0;
  width: 100%;
  height: 100%;
  // border-right: solid 2px $--color-white;
  // clip-path: polygon(100% 0, 100% 80%, 80% 100%, 0 100%, 0 0);
  overflow: hidden;
}
.gridCard:hover .gridCardOverlay {
  background-color: rgba(0, 0, 0, 0.4);
}
.gridCardIcon {
  position: absolute;
  background-color: white;
  height: 100%;
  width: 100%;
  top: 0;
  left: 0;
}
.gridCard:hover .gridCardIcon {
  opacity: 0;
}
</style>
