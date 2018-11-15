<template>
  <div class="storyCard" ref='card' @click="clicked($event)" @mouseover="hover(true)" @mouseleave="hover(false)">
    <div class="toolbox" ref="toolbox" v-if='parseInt(notools) === 0'>
      <el-tooltip content="Edit Story" placement="top">
        <i class="fas fa-pencil-alt" @click.prevent='openEdit()'></i>
      </el-tooltip>
      <el-tooltip content="Delete Story" placement="top">
        <i class="fas fa-times" @click="deleteStory()"></i>
      </el-tooltip>
    </div>
    <span class="storyName">{{this.name}}</span>
    <span class="storyDescription">{{this.description}}</span>
    <div class='plus' v-if='plus'>
      <i class="fas fa-plus"></i>
    </div>
  </div>
</template>

<script>
import mediapicker from '@/components/account/mediapicker.vue'
export default {
  name: 'storyCard',
  props: ['name', 'description', 'selected', 'media', 'story_id', 'index', 'notools', 'plus', 'group'],
  components: {
    mediapicker
  },
  mounted () {
    if (this.media) {
      this.$refs.card.style.background = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.9),  rgba(0, 0, 0, 0.2)),url("' + process.env.ROOT_API + '/energy/images/' + this.media + '") center/cover no-repeat'
    } else {
      this.$refs.card.style.backgroundColor = 'rgb(26,26,26)'
    }
    if (this.selected) {
      this.$refs.card.style.borderColor = 'rgb(215,63,9)'
      this.$refs.card.style.borderWidth = '4px'
    }
  },
  watch: {
    selected: function (value) {
      if (value) {
        this.$refs.card.style.borderColor = 'rgb(215,63,9)'
        this.$refs.card.style.borderWidth = '4px'
      } else {
        this.$refs.card.style.borderColor = 'rgb(0,0,0)'
        this.$refs.card.style.borderWidth = '2.5px'
      }
    },
    media: function (value) {
      if (value) {
        this.$refs.card.style.background = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.9),  rgba(0, 0, 0, 0.2)),url("' + process.env.ROOT_API + '/energy/images/' + value + '") center/cover no-repeat'
      } else {
        this.$refs.card.style.background = 'rgb(26,26,26)'
      }
    }
  },
  methods: {
    hover: function (enter) {
      if (this.$refs.toolbox) {
        if (enter) {
          this.$refs.toolbox.style.display = 'block'
        } else {
          this.$refs.toolbox.style.display = 'none'
        }
      }
    },
    openEdit: function () {
      this.$eventHub.$emit('openStoryEdit', [this.name, this.description, this.media, this.story_id])
    },
    clicked: function (event) {
      if (event.target.parentNode.classList.contains('toolbox') || event.target.classList.contains('toolbox')) {
        return
      }
      this.$emit('click')
    },
    deleteStory: function () {
      this.$eventHub.$emit('deleteStory', [this.story_id])
    },
    saveTemp: function () {

    }
  }
}

</script>

<style scoped>
.toolbox {
  position: absolute;
  right: 10px;
  top: 5px;
  display: none;
  cursor: pointer;
}
.fas {
  color: #FFFFFF88;
  font-size: 1.5em;
  padding-left: 0.2em;

}
.fas.fa-times {
  font-size: 1.8em;
}
.storyName {
  color:rgb(215,63,9);
  font-family: 'StratumNo2';
  font-size: 1.7em;
  display: block;
  z-index: 1;
}
.storyCard {
  position: relative;
  border: 2.5px solid rgb(0,0,0);
  padding: 1em;
  height: 150px;
  margin: 1em;
  border-radius: 5px;
  overflow: hidden;
  /* width: 250px; */

}
.storyCard:hover .plus .fas {
  color: #FFF !important;
}
.image {
  position: absolute;
  right: 0px;
  bottom: 0px;
  height: 100%;
  z-index: 0;
}
.storyDescription {
  color: #FFF;
  font-family: 'StratumNo2';
  font-size: 1.2em;
  display: block;
  padding-left: 0.3em;
  z-index: 1;
}
.plus {
  text-align: center;
}
.plus .fas {
  font-size: 6em;
  line-height: 150px;
  text-align: center;
  width: calc(100% - .33em);
}
.plus .fas {
  color: rgb(215,63,9) !important;
}

</style>
