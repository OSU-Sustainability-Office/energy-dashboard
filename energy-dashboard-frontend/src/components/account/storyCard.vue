<template>
  <div class="storyCard" ref='card' @click="clicked($event)" @mouseover="hover(true)" @mouseleave="hover(false)">
    <div class="toolbox" ref="toolbox" v-if='!notools'>
      <i class="fas fa-pencil-alt" @click.prevent='openEdit()' v-b-tooltip.hover title='Edit Story Card'></i>
      <i class="fas fa-times" @click="deleteStory()" v-b-tooltip.hover title='Delete Story'></i>
    </div>
    <span class="storyName">{{this.name}}</span>
    <span class="storyDescription">{{this.description}}</span>
    <div class='plus' v-if='plus'>
      +
    </div>
    <b-modal size='lg' v-model='openModal' title='Edit Story' body-bg-variant="light" header-bg-variant="light" footer-bg-variant="light" @ok='saveTemp()' footer-class='storycard-modal-footer'>
      <b-container>
        <div class="row">
          <label>Name:</label>
          <el-input type="text" v-model="tempName"></el-input>
        </div>
        <div class="row">
          <label>Description:</label>
          <el-input type="text" v-model="tempDescription"></el-input>
        </div>
        <div class='row'>
          <mediapicker :media='this.tempMedia' />
        </div>
      </b-container>
    </b-modal>
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
      this.$refs.card.style.background = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.9),  rgba(0, 0, 0, 0.2)),url("' + process.env.ROOT_API + 'block-media/thumbs/' + this.media + '") center/cover no-repeat'
    } else {
      this.$refs.card.style.backgroundColor = 'rgb(26,26,26)'
    }
    if (this.selected) {
      this.$refs.card.style.borderColor = 'rgb(215,63,9)'
      this.$refs.card.style.borderWidth = '4px'
    }
  },
  data () {
    return {
      openModal: false,
      tempName: '',
      tempDescription: '',
      tempMedia: ''
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
        this.$refs.card.style.background = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.9),  rgba(0, 0, 0, 0.2)),url("' + process.env.ROOT_API + 'block-media/thumbs/' + value + '") center/cover no-repeat'
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
      this.tempName = this.name
      this.tempDescription = this.description
      this.tempMedia = this.media
      this.openModal = true
    },
    clicked: function (event) {
      if (event.target.classList.contains('fas') || event.target.classList.contains('toolbox')) {
        return
      }
      this.$emit('click')
    },
    deleteStory: function () {
      this.$eventHub.$emit('deleteStory', [this.group, this.index])
    },
    saveTemp: function () {
      this.$eventHub.$emit('updateStory', [this.group, this.index, this.tempName, this.tempDescription, this.tempMedia])
    }
  }
}

</script>
<style>
/* .storycard-modal-footer .btn-primary {
  background-color: rgb(215,63,9) !important;
  border: solid 1px rgb(215,63,9);
}
.storycard-modal-footer .btn-primary:hover {
  background-color: rgb(215,63,9) !important;
  border: solid 1px rgb(215,63,9);
}
.storycard-modal-footer .btn-primary:active {
  background-color: rgb(215,63,9) !important;
  border: solid 1px rgb(215,63,9);
}
.storycard-modal-footer .btn-secondary {
  background-color: rgb(26,26,26) !important;
  border: solid 1px rgb(26,26,26);
}
.storycard-modal-footer .btn-secondary:hover {
  background-color: rgb(26,26,26) !important;
  border: solid 1px rgb(26,26,26);
} */

</style>

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
  font-size: 1.8em;
  display: block;
  z-index: 1;
}
.storyCard {
  position: relative;
  border: 2.5px solid rgb(0,0,0);
  padding: 1em;
  height: 150px;
  /* margin-left: 0.5%;
  margin-right: 0.5%; */
  margin-top: 1em;
  border-radius: 5px;
  overflow: hidden;
  width: 250px;

}
.storyCard:hover .plus {
  color: #FFF;
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
  color: rgb(215,63,9);
  font-size: 6em;
  line-height: 1em;
  text-align: center;
}

</style>
