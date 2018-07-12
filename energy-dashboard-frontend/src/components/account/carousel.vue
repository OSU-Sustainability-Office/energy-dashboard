<template>
  <div class="container-fluid caro">
    <div class="flex" v-bind:class="{ maximized : isMaximized }">
      <storyCard  v-for="card in cards" @edit="edit(card.id)" @caro-click="clickedStory(card.id)" v-bind:name="card.name" v-bind:description="card.description" v-bind:media="card.media" v-bind:story_id="card.id" v-bind:selected="card.featured" ref="cardsvue"/>
      <div class="addStory" @click="addStory()" >
        +
      </div>
    </div>
    <div id="expand" v-on:click="isMaximized = !isMaximized"><i class="fas" v-bind:class="{ 'fa-chevron-circle-down' : !isMaximized, 'fa-chevron-circle-up' : isMaximized }"></i></div>

  </div>
</template>

<script>
import storyCard from '@/components/account/storyCard'
import axios from 'axios';
export default {
  name: 'carousel',
  props: ['cards'],
  components: {
    storyCard
  },
  data () {


    return {
      isMaximized: false,
    }
  },
  created () {

  },
  methods: {
    addStory: function() {
      var card = {
        name: "New Story",
        description: "story description",
        media: "",
        featured: false
      }
      var data = {
        name : card.name,
        descr : card.description
      }
      axios('http://localhost:3000/api/updateStory',{method: "post",data:data, withCredentials:true}).then(rid => {
        if (!card.id)
          card.id = rid.data.insertId;
        this.cards.push(card);
      }).catch(err => {
        console.log(err);
      });

    },
    edit: function(id) {
      this.$emit('edit',[id]);
    },
    clickedStory: function(id) {
      this.$refs.cardsvue.forEach(card => {
        if (card.story_id === id) {
          card.selected = true;
        }
        else {
          card.selected = false;
        }
      });
      this.$emit('caro-click',[id]);
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.caro {
  position: absolute;
  top:0px;
  right:0px;
  z-index: 1;
  background-color: #FFF;
  box-shadow: 0px 1px 4px rgba(0,0,0,0.5);
}
.flex {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  overflow: scroll;
  overflow-y: hidden;
  margin-right: 5em;
  margin-left: 1em;
  padding-top: 1em;
  padding-bottom: 1em;
  height: auto;
  -webkit-transition: height 2s;
  transition: flex-wrap 2s ease-in-out;
}
.flex > * {
  flex-shrink: 0;
}
.maximized {
  flex-wrap: wrap;
  justify-content: center;
  align-items: center;
}
#expand {
  font-size: 2em;
  z-index: 3;
  top: 11em;
  left: 49%;
  margin: 0;
  padding: 0;
  text-align: center;
}
#expand:hover {
  cursor: pointer;
  color: #D73F09;
}
.slide-enter, .slide-leave-to{
  transform: scaleY(0)
}
.slide-enter-active, .slide-leave-active{
  transition: transform 0.5s ease-in-out;
}
.addStory {
  font-size: 5em;
  color: rgb(215,63,9);
  height: 150px;
  margin-left: 0.5%;
  margin-right: 0.5%;
  margin-top: 0.2em;
  border-radius: 5px;
  overflow: hidden;
  width: 250px;
  line-height: 150px;
  border: 2.5px solid rgb(0,0,0);
  text-align: center;
  background-color: #FFF;
}
</style>
