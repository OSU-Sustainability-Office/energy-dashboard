<template>
  <el-row class="stage">
    <el-col :span="24" class="main">
      <div element-loading-background="rgba(0, 0, 0, 0.3)" class="background" ref="main">
        <div class="title">{{ name }}</div>
        <div class="subtitle">{{ description }}</div>
      </div>
    </el-col>
  </el-row>
</template>
<script>
export default {
  name: 'heropicture',
  props: ['media', 'name', 'description'],
  data () {
    return {
      arrayType: false,
      api: process.env.VUE_APP_ROOT_API
    }
  },
  watch: {
    // imageString is a string containing the image filename in the S3 bucket. ie: mcnary_2.jpg
    media: function ( imageString ) {
      this.$refs.main.style.backgroundImage = ''
      if ( imageString ) {
        this.$refs.main.style.backgroundImage =
          'linear-gradient(to bottom right, rgba(0, 0, 0, 0.7),  rgba(0, 0, 0, 0.2)), url("https://osu-energy-images.s3-us-west-2.amazonaws.com/' +
          imageString +
          '")'
      } else {
        this.$refs.main.style.backgroundColor = 'rgb(26,26,26)'
      }
    }
  },
  mounted () {
    this.$refs.main.style.backgroundImage = ''

    if ( this.media ) {
      this.$refs.main.style.backgroundImage =
        'linear-gradient(to bottom right, rgba(0, 0, 0, 0.7),  rgba(0, 0, 0, 0.2)),url("https://osu-energy-images.s3-us-west-2.amazonaws.com/' +
        this.media +
        '")'
    } else {
      this.$refs.main.style.backgroundColor = 'rgb(26,26,26)'
    }
  },
  methods: {
    classForIndex: function ( index ) {
      if ( this.media.length === 1 ) {
        return 'slantImage unCut'
      } else if ( index === 0 ) {
        return 'slantImage leftEnd'
      } else if ( index + 1 === this.media.length || index >= 3 ) {
        return 'slantImage rightEnd'
      } else {
        return 'slantImage'
      }
    }
  }
}
</script>
<style lang="scss" scoped>
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
  font-family: 'StratumNo2';
  color: $--color-white;
  font-size: 3.2em;
  z-index: 5;
  position: absolute;
  top: 0.4em;
  left: 0.5em;
  -webkit-text-stroke: 0.6px black;
  width: 75%;
  overflow: hidden;
  text-overflow: ellipsis;
}
.subtitle {
  font-family: 'StratumNo2';
  color: #fff;
  font-size: 1.8em;
  position: absolute;
  top: 0.4em;
  left: 0.5em;
  padding-left: 1.5em;
  padding-top: 2.5em;
  -webkit-text-stroke: 0.6px black;
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
.gradientOverlay {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-image: linear-gradient(to bottom right, rgba(0, 0, 0, 0.7), rgba(0, 0, 0, 0.2));
}
</style>
