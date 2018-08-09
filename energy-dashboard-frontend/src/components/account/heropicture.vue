<template>
  <div class="container-fluid background" ref='main'>
    <div class='title'>{{name}}</div>
    <div class='subtitle'>{{description}}</div>
  </div>
</template>
<script>
import axios from 'axios';
export default {
  name: 'heropicture',
  props: ['id'],
  data() {
    return {
      media: "",
      name: "",
      description: ""
    }
  },
  created() {
    axios.get(process.env.ROOT_API+'api/getStoryData?id='+this.id).then(r => {
      this.media = r.data[0].media;
      this.name = r.data[0].name;
      this.description = r.data[0].description;
    });
  },
  watch: {
    id: function(value) {
      axios.get(process.env.ROOT_API+'api/getStoryData?id='+value).then(r => {
        this.media = r.data[0].media;
        this.name = r.data[0].name;
        this.description = r.data[0].description;
      });
    },
    media: function(value) {
      this.$refs.main.style.backgroundImage = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.7),  rgba(0, 0, 0, 0.2)),url(\''+process.env.ROOT_API+"block-media/"+value+'\')';
    }
  }

}
</script>
<style scoped>
  .background {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 200px;
    width:100%;
    background-position: center;
    background-size: cover;
    background-repeat: no-repeat;

  }
  .title {
    font-family: "StratumNo2";
    color: #D73F09;
    font-size: 3.2em;
    padding-left: 0.5em;
    padding-top: 0.4em;
  }
  .subtitle {
    font-family: "StratumNo2";
    color: #FFF;
    font-size: 1.8em;
    padding-left: 1.5em;
  }
</style>
