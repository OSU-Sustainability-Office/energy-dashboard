/*
 * @Author: you@you.you
 * @Date:   Saturday January 11th 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Saturday January 11th 2020
 * @Copyright:  (c) Oregon State University 2020
 */
<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-04T10:08:23-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-31T12:28:01-08:00
-->

<template>
  <el-row class="container" ref="mainstage">
    <el-col :span='24' ref="imageNodes">
      <el-row type='flex' justify='left' class='row'>
        <el-col :span='6'>
          <div class='col' @click="select('')" style='backgroundColor: rgb(26,26,26)' v-bind:class="[selected === 0 ? 'selected' : 'e']"></div>
        </el-col>
        <el-col :span='6' v-for='(image,index) in images' :key='index'>
          <div class='col' @click="select(image)" :style='"background-image:url(\"" + api + "/image?name=" + image + "\")"' v-bind:class="[selected === (index + 1) ? 'selected' : 'e']"></div>
        </el-col>
        <el-col v-for='n in 10' :key='n+"bad"' :span='6' class='noHeight'></el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
export default {
  name: 'mediapicker',
  props: ['value'],
  data () {
    return {
      images: [],
      selected: 0,
      api: process.env.VUE_APP_ROOT_API
    }
  },
  created () {
    this.$store.dispatch('map/imageList').then(r => {
      this.images = []
      var index = 0
      for (var i of r) {
        this.images.push(i)
        if (i === this.value) { this.selected = index }
        index++
      }
    })
  },
  watch: {
    value: function (value) {
      this.selected = this.images.indexOf(this.value) + 1
    }
  },
  methods: {
    select: function (image) {
      this.$emit('input', image)
    }
  }
}
</script>
<style scoped>
label {
  color: white;
  font-family: 'Open Sans', sans-serif;
}
.selected {
  outline: solid 4px rgb(215,63,9);
  outline-offset: -5px;
  border: solid 1px rgb(215,63,9);
  overflow: hidden;
}
.container {
  width: 100%;
  padding: 0px;
  margin: auto;
  max-height:400px;
  overflow-y: scroll;

}
.row {
  flex-wrap: wrap !important;
  overflow-x: hidden;
}
.row > * {
  height: 100px;
  margin: 0.5em;
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  min-width: 200px;
}
.row > *:not(.noHeight) {
  cursor: pointer;
}
.col {
  height: 100%;
  width: 100%;
  border-radius: 5px;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}
.noHeight {
  height: 0px;
}
</style>
