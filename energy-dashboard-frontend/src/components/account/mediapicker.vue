<template>
  <div class="container" ref="mainstage">
    <div class='row' ref="imageNodes">
      <div class='col' @click="selected = 0" style='backgroundColor: rgb(26,26,26)'></div>
      <div v-for='(image,index) in images' @click="selected = index+1" class='col' :style='"background-image:url(\""+image+"\")"'>
      </div>

    </div>
  </div>
</template>
<script>
import axios from 'axios'
export default {
  name: 'mediapicker',
  data() {
    return {
      images : [],
      selected : 0,
      selectedString: ""
    }
  },
  mounted() {

    axios.get('http://localhost:3000/api/listAvailableMedia').then(val => {
      var index = 0;
      for (var i of val.data) {
        this.images.push("http://localhost:3000/block-media/thumbs/"+i);
        if (i === this.$parent.media)
          this.selected = index+1;
        index++;
      }
      this.$nextTick(()=> {
        var index = 0;
        for (var node of this.$refs.imageNodes.children) {
          if (index === this.selected)
            node.style.border = "solid 2px rgb(215,63,9)";
          else {
            node.style.border = "solid 1px rgb(255,255,255)";
          }
          index++;
        }
      });
    });
  },
  watch: {
    selectedString: function(v) {

    },
    selected: function(value) {
      var index = 0;
      for (var node of this.$refs.imageNodes.children) {
        if (index === this.selected) {
          node.style.border = "solid 2px rgb(215,63,9)";
          if (index -1 < 0)
            this.$parent.media = null;
          else
            this.$parent.media = this.images[index-1].replace("http://localhost:3000/block-media/thumbs/","");
        }
        else {
          node.style.border = "solid 1px rgb(255,255,255)";
        }
        index++;
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
