<template>
  <div class="storyCard" ref='card' v-on:click="clicked">
    <span class="storyName">{{this.name}}</span>
    <span class="storyDescription">{{this.description}}</span>
  </div>
</template>

<script>
export default {
  name: 'storyCard',
  props: ['name', 'description', 'selected','media','story_id'],
  mounted() {
    if (this.media)
      this.$refs.card.style.background = "linear-gradient(to bottom right, rgba(0, 0, 0, 0.9),  rgba(0, 0, 0, 0.2)),url('"+this.media+"') center/cover no-repeat";
    else
      this.$refs.card.style.backgroundColor = 'rgb(26,26,26)';
      if (this.selected)
        this.$refs.card.style.borderColor = 'rgb(215,63,9)';
  },
  data() {
    return {
    }
  },
  watch: {
    selected: function(value) {
      if (value)
        this.$refs.card.style.borderColor = 'rgb(215,63,9)';
      else
        this.$refs.card.style.borderColor = 'rgb(0,0,0)';
    }
  },
  methods: {
    clicked: function() {
      // this.$parent.cards.forEach(val =>{
      //   val.selected = false;
      // });

      //this.selected = true;
      //console.log(this.$parent.cards);
      this.$emit('caro-click');
    }
  }
}

</script>

<style scoped>
.storyName {
  color:rgb(215,63,9);
  font-family: 'StratumNo2';
  font-size: 1.8em;
  display: block;
  z-index: 1;
}
.storyCard {
  border: 2.5px solid rgb(0,0,0);
  padding: 1em;
  height: 150px;
  margin-left: 0.5%;
  margin-right: 0.5%;
  margin-top: 1em;
  border-radius: 5px;
  overflow: hidden;
  width: 250px;
  
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
</style>
