<template>
  <div class="container-fluid caro">
    <div class="scroll">
      <div class="flex" v-bind:class="{ maximized : isMaximized }">
        <storyCard  v-for="(card,index) in cards" @edit="edit(card.id)" @caro-click="clickedStory(index)" v-bind:index="card.index" v-bind:name="card.name" v-bind:description="card.description" v-bind:media="card.media" v-bind:story_id="card.id" v-bind:selected="card.featured" ref="cardsvue"/>
        <div class="addStory" @click="addStory()" >
          <span>+</span>
        </div>
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
    this.$eventHub.$on('storyCardChange', data => {
      for (var card of this.cards) {
        if (card.id === data[0]) {
          console.log(card);
          card.name = data[1];
          card.description = data[2];
          card.media = data[3];
        }
      }
    });
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
      axios(process.env.ROOT_API+'api/updateStory',{method: "post",data:data, withCredentials:true}).then(rid => {
        card.id = rid.data;
        this.cards.push(card);
      }).catch(err => {
        console.log(err);
      });

    },
    edit: function(id) {
      this.$emit('edit',[id]);
    },
    clickedStory: function(index) {
      this.cards.forEach(c =>{c.featured = false});
      this.cards[index].featured = true;
      this.$emit('caro-click',[this.cards[index].id]);
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
  padding: 0;
}
.scroll {
  overflow-x: scroll;
  width: 100%;

}
.flex {
  display: flex;
  flex-wrap: nowrap;
  align-items: flex-start;
  padding: 1em;
  height: auto;
  box-sizing: border-box;
  flex-direction: row;
  float:left;
  min-width: 100%;
}
.flex > div {
  flex-shrink: 0;
  /* flex: 1 1 auto; */
  margin: 0.4em;
  min-width: 250px;
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
  color: #D73F09;
}
.slide-enter, .slide-leave-to{
  transform: scaleY(0)
}
.slide-enter-active, .slide-leave-active{
  transition: transform 0.5s ease-in-out;
}
.addStory span {
  position: absolute;
  top: 0px;
  left: 0px;
  font-size: 4em;
  line-height: 150px;
  width: 100%;
  text-align: center;
  cursor: default;
}
.addStory {
  position: relative;
  top: 0px;
  border: 2.5px solid rgb(0,0,0);
  padding: 1em;
  height: 150px;
  padding: auto;
  vertical-align: middle;
  text-align: center;
  color: rgb(215,63,9);
  margin-top: 1em;
  border-radius: 5px;
  overflow: hidden;
  width: 250px;
}
</style>
