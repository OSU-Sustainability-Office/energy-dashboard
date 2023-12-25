<template>
  <div class="block" ref="block" @click="$emit('click')">
    <el-row style="padding: 0">
      <el-col :span="24" ref="imageContainer" class="imageContainer" v-loading="!loaded">
        <span class="campaignName">{{ camp.name }}</span>
      </el-col>
    </el-row>
    <el-row class="popped">
      <el-col :span="4" class="standings"> </el-col>
      <el-col :span="20" class="dates"> {{ camp.dateStart | trunc }} - {{ camp.dateEnd | trunc }} </el-col>
    </el-row>
  </div>
</template>
<script>
export default {
  props: ['camp'],
  data() {
    return {
      loaded: true,
      mediaSource: ''
    }
  },
  mounted() {
    // Load the media content
    this.$refs.imageContainer.$el.style.backgroundImage =
      'url("https://osu-energy-images.s3-us-west-2.amazonaws.com/' + this.camp.media + '")'
  },
  filters: {
    trunc: function (val) {
      const d = new Date(val)
      return d.getMonth() + 1 + '/' + d.getDate() + '/' + d.getFullYear()
    }
  }
}
</script>
<style scoped lang="scss">
.imageContainer {
  height: 180px;
  width: 100%;
  left: 0px;
  margin: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.image {
  position: absolute;
  top: 0;
  left: 0;
  background-size: cover;
  background-position: center;
  background-repeat: no-repeat;
}
.block {
  margin: 1em;
  position: relative;
  height: 220px;
  background-color: $--color-black;
  border-radius: 5px;
  overflow: hidden;
  text-align: left;
}
.block:hover {
  cursor: pointer;
}
.block:hover .popped {
  background-color: $--color-primary;
}
.block:hover .dates {
  color: $--color-white !important;
}

.block .el-row:not(.popped) {
  padding: 1em;
}
.campaignName {
  font-size: 34px;
  color: $--color-white;
  font-family: 'StratumNO2';
}
.popped {
  background-color: $--color-black;
  position: absolute;
  height: 50px;
  bottom: 0px;
  width: 100%;
  border-top: 1px solid $--color-white;
  // box-shadow: inset 0 6px 5px -6px #000000;
}
.popped .el-col {
  padding: 1em;
  color: $--color-primary;
}
.dates {
  font-family: 'StratumNO2';
  text-align: right;
  font-size: 22px;
  line-height: 5px;
  color: $--color-primary !important;
}
.standings {
  font-size: 16px;
  line-height: 15px;
}
</style>
