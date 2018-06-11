<template>
  <div>
    <div class="titleSection">
      <div class="imgBox" ref='mediaBox'>
        <!-- <img :src='media' /> -->
      </div>
      <div class="gradBox">
        <span class="storyTitle">{{ name | capatilize }}</span>
        <span class="blockTitle">{{ description | capatilize }}</span>
      </div>
    </div>
    <card v-if="blocks[currentBlock]" v-bind:graph_type="blocks[currentBlock].graph_type" v-bind:name="blocks[currentBlock].name" v-bind:description="blocks[currentBlock].descr" v-bind:media="blocks[currentBlock].media" />
  </div>
</template>

<script>

import axios from 'axios';
import card from '@/components/story/card'

export default {
  name: 'story',
  props: ['id'],
  components: {
    card
  },
  data() {
    return {
      name : null,
      description : null,
      blocks : [],
      media : null,
      currentBlock : 0
    }
  },
  mounted() {
    if (this.$refs.mediaBox)
    this.$refs.mediaBox.style.backgroundImage = "linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0) 30%),url('"+this.media+"')";
  },
  watch: {
    media: function(value) {
      if (this.$refs.mediaBox)
      this.$refs.mediaBox.style.backgroundImage = "linear-gradient(to right, rgba(0,0,0,0.9), rgba(0,0,0,0) 30%),url('"+this.media+"')";
    }
  },
  methods : {
    isNextBlock : function() {
      if (this.currentBlock >= this.blocks.length-1)
        return false;
      else
        return true;
    },
    isPreviousBlock : function() {
      if (this.currentBlock > 0)
        return true;
      else
        return false;
    },
    nextBlock : function() {
      console.log("yo");
      this.currentBlock++;
    },
    prevBlock : function() {
      this.currentBlock--;
    }
  },
  created() {
    axios.get('http://localhost:3000/api/getStoryData?id='+this.id).then(res => {
      this.name = res.data[0].name;
      this.description = res.data[0].description;
      this.media = res.data[0].media;
    });
    axios.get('http://localhost:3000/api/getBlockDataForStory?id='+this.id).then(res => {
      this.blocks = res.data;
    }).catch(err => {
    });
  },
  filters : {
    capatilize: function(value) {
      if (value)
      return value.toUpperCase();
      return;
    }
  }
}



</script>

<style>
.titleSection img {
  width: 100%;
  height: auto;
  padding: 0;
  position: absolute;
  margin-top: -31%;
}
.storyTitle {
  font-size: 4em;
  font-family: 'StratumNo2';
  z-index: 2;
  position: absolute;
  top: 0px;
  padding-top: 0.2em;
  padding-left: 0.8em;
  color: rgba(255,255,255,0.6);
  font-weight: bold;
}
.blockTitle {
  font-size: 3em;
  font-family: 'StratumNo2';
  z-index: 2;
  position: absolute;
  top: 0px;
  padding-top: 1.55em;
  padding-left: 1.05em;
  color: rgba(215,63,9,0.8);
  font-weight: bold;
}
.titleSection {
  height: 10em;
  position: relative;
  white-space: nowrap;
}
.imgBox {
  width: 100%;
  height: 100%;
  background-size: cover;
  background-repeat: no-repeat;
  background-position: center;
}

</style>
