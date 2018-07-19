<template>
  <div class="background">
    <!-- <span class="main-heading">Stories</span> -->
    <carousel v-bind:cards="cards" @edit="editStory($event)" @caro-click='changeStory($event)' class="scrollyBox" ref="caro"/>
    <!-- <span class="main-heading">Featured Blocks</span> -->
    <featured v-bind:cards="cardsFeatured" ref='featureBox' v-if='!editingStory && currentStory !== null'/>
    <storyEdit v-if='editingStory' ref='storyEdit'/>
    <div class="nocards" v-if="currentStory === null">
      Please create  a story to get started
    </div>
  </div>
</template>

<script>
import carousel from '@/components/account/carousel'
import featured from '@/components/account/featured'
import storyEdit from '@/components/account/storyEdit'
import axios from 'axios';

export default {
  name: 'account',
  components: {
    carousel,
    featured,
    storyEdit
  },
  props: [],
  data() {
    return {
      cards: [],
      cardsFeatured: [],
      currentStory: null,
      editingStory: false
    }
  },
  mounted () {
    this.$eventHub.$emit('loggedIn',[]);
  },
  created() {
     axios(process.env.ROOT_API+'api/getStoriesForCurrentUser',{method: "get", withCredentials:true}).then (res => {
       this.cards = res.data;
     }).catch (e => {
      this.errors.push(e);
     });
     this.$eventHub.$on('deleteStory', val => {
       var data = {
         id : val[0]
       }
       axios(process.env.ROOT_API+'api/deleteStory',{method: "post",data:data, withCredentials:true}).catch(err => {
         console.log(err);
       });
       for (var c in this.cards)
        if (this.cards[c].id === val[0]){
          this.cards.splice(c,1);
          if (this.cards.length === 0) {
            this.currentStory = null;
          }
          if (val[0] === this.currentStory) {
            this.$refs.caro.clickedStory(c-1);
          }
          return;
        }

     });
  },
  watch: {
    cards: function(value) {
      for (var i = 0; i < this.cards.length; i++) {
        if (this.cards[i].featured) {
          this.currentStory = this.cards[i].id;
          axios.get(process.env.ROOT_API+'api/getBlocksForStory?id='+this.cards[i].id).then (res => {

            this.cardsFeatured = res.data;
          });
          return;
        }
      }
    }
  },
  methods: {
    editStory: function(event) {
      this.editingStory = true;
      this.$nextTick(function() {
        this.$refs.storyEdit.storyid = event[0];
        for (var i = 0; i < this.cards.length; i++) {
          if (this.cards[i].id === event[0]) {
            this.$refs.storyEdit.name = this.cards[i].name;
            this.$refs.storyEdit.descr = this.cards[i].description;
            this.$refs.storyEdit.media = this.cards[i].media;

            break;
          }
        }
      });

    },
    changeStory: function(event) {
      //this.cardsFeatured = null;
      this.editingStory = false;
      this.currentStory = event[0];
      axios(process.env.ROOT_API+'api/changeFeaturedStory',{method: "post", data:{id: event[0]}, withCredentials:true}).catch(e => {
        console.log(e);
      });
      axios.get(process.env.ROOT_API+'api/getBlocksForStory?id='+event[0]).then (res => {

        this.cardsFeatured = res.data;
        this.$nextTick(() => {
          this.$eventHub.$emit('reloadChart');
        });

      });
    }
  },
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.background {
  background: #fff;
  top: 4em;
  bottom: 0px;
  position: absolute;
  width: 100%;
  padding: 1em;
}
.nocards {
  color: black;
  position: absolute;
  top: 400px;
  left: 0px;
  width: 100%;
  padding: 2em;
  text-align: center;
  font-size: 2em;
}
.main-heading {
  font-size: 3em;
  margin-left: .3em;
}
.scrollyBox {
  /* background-color: rgb(183,169,154); */
}
</style>
