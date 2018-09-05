<template>
  <div class="container" ref="mainstage">
    <div class='row' ref="imageNodes">
      <div class='col' @click="selected = 0" style='backgroundColor: rgb(26,26,26)' v-bind:class="[selected === 0 ? 'selected' : 'e']"></div>
      <div v-for='(image,index) in images' @click="selected = index + 1" :key='index' class='col' :style='"background-image:url(\"" + api + "block-media/thumbs/" + image + "\")"' v-bind:class="[selected === (index + 1) ? 'selected' : 'e']">
      </div>

    </div>
  </div>
</template>
<script>
export default {
  name: 'mediapicker',
  props: ['media'],
  data () {
    return {
      images: [],
      selected: 0,
      api: process.env.ROOT_API
    }
  },
  created () {
    this.$store.dispatch('media').then(r => {
      var index = 0
      for (var i of r) {
        this.images.push(i)
        if (i === this.media) { this.selected = index }
        index++
      }
    })
  },
  watch: {
    selected: function (value) {
      if (value === 0) {
        this.$parent.$parent.tempMedia = ''
      } else {
        this.$parent.$parent.tempMedia = this.images[value - 1]
      }
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
  border: solid 4px rgb(215,63,9);
}
.container {
  width: 100%;
  padding: 0px;
  margin: auto;
  max-height:400px;
  overflow-y: scroll;

}
.row {
  width: 100%;
  padding: 0px;
  margin: auto;
  float: none;
  align-items: flex-start;
  justify-content: center;
}
.col {
  height: 100px;
  background-repeat: no-repeat;
  background-size: cover;
  background-position: center;
  flex-grow: 0;
  flex-shrink: 0;
  flex-basis: 200px;
  margin: 0.5em;
  border-radius: 5px;
  align-self: flex-start;
  float: left;
}
</style>
