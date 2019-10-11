<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-04T10:08:23-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-31T13:44:50-08:00
-->

<template>
  <el-row class='stage'>
    <el-col :span='24' class='main'>
      <div element-loading-background="rgba(0, 0, 0, 0.3)" class="background" ref='main'>

        <div v-for='(pic, index) in media' :class='classForIndex(index)' :style='`background-image: url("${pic}"); width:calc(${100 / ((media.length < 4) ? media.length : 4)}% + ${ (index === 0)? "22.5px" : "55px"});`' v-if='arrayType && index < 4' :key='index'></div>
        <div v-if='arrayType' class='gradientOverlay'> </div>
        <div class='title'>{{name}}</div>
        <div class='subtitle'>{{description}}</div>
      </div>
    </el-col>
  </el-row>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'heropicture',
  props: ['media', 'name', 'description'],
  computed: {
    ...mapGetters([
      'story'
    ])
  },
  data () {
    return {
      arrayType: false,
      rootAPI: process.env.VUE_APP_ROOT_API
    }
  },
  watch: {
    media: function (value) {
      this.$refs.main.style.backgroundImage = ''
      if (Array.isArray(value)) {
        this.arrayType = true
        this.$refs.main.style.backgroundColor = 'rgb(255,255,255)'
        this.$refs.main.style.borderBottom = 'solid 2px rgb(26,26,26)'
        return
      }
      if (value) {
        this.$refs.main.style.backgroundImage = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.7),  rgba(0, 0, 0, 0.2)),url(\'' + value + '\')'
      } else {
        this.$refs.main.style.backgroundColor = 'rgb(26,26,26)'
      }
    }
  },
  mounted () {
    this.$refs.main.style.backgroundImage = ''
    if (this.media) {
      if (Array.isArray(this.media)) {
        this.arrayType = true
        this.$refs.main.style.backgroundColor = 'rgb(255,255,255)'
        this.$refs.main.style.borderBottom = 'solid 2px rgb(26,26,26)'
      } else {
        this.$refs.main.style.backgroundImage = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.7),  rgba(0, 0, 0, 0.2)),url(\'' + this.media + '\')'
      }
    } else {
      this.$refs.main.style.backgroundColor = 'rgb(26,26,26)'
    }
  },
  methods: {
    classForIndex: function (index) {
      if (this.media.length === 1) {
        return 'slantImage unCut'
      } else if (index === 0) {
        return 'slantImage leftEnd'
      } else if (index + 1 === this.media.length || index >= 3) {
        return 'slantImage rightEnd'
      } else {
        return 'slantImage'
      }
    }
  }
}
</script>
<style lang='scss' scoped>
  .stage {
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    padding: 0;
    margin: 0;
    height: 200px !important;
  }
  .main {
    padding: 0;
  }
  .background {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
    width: 100%;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;
    white-space: nowrap;
    overflow: hidden;
  }
  .title {
    font-family: "StratumNo2";
    color: #D73F09;
    font-size: 3.2em;
    z-index: 5;
    position: absolute;
    top: 0.4em;
    left: 0.5em;
  }
  .subtitle {
    font-family: "StratumNo2";
    color: #FFF;
    font-size: 1.8em;
    padding-left: 1.5em;
  }
  $slope: 160px / 4;
  $border-width: 3px;
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
    left: -2 * $slope + 2*$border-width;
  }
  .slantImage:nth-child(4) {
    left: -3 * $slope + 3*$border-width;
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
  .gradientOverlay {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: 100%;
    background-image: linear-gradient(to bottom right, rgba(0, 0, 0, 0.7),  rgba(0, 0, 0, 0.2));
  }
</style>
