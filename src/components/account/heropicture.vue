<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-04T10:08:23-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-31T13:44:50-08:00
-->

<template>
  <el-row class='stage'>
    <el-col :span='24' class='main'>
      <div v-loading='(story)? !story.loaded : true' element-loading-background="rgba(0, 0, 0, 0.3)" class="background" ref='main'>
        <div class='title'>{{name}}</div>
        <div class='subtitle'>{{description}}</div>
      </div>
    </el-col>
  </el-row>
</template>
<script>
import { mapGetters } from 'vuex'

export default {
  name: 'heropicture',
  props: ['media', 'name', 'description'],
  computed: {
    ...mapGetters([
      'story'
    ])
  },
  watch: {
    media: function (value) {
      this.$refs.main.style.backgroundImage = ''
      if (Array.isArray(value)) {
        value = null
      }
      if (value) {
        this.$refs.main.style.backgroundImage = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.7),  rgba(0, 0, 0, 0.2)),url(\'' + process.env.VUE_APP_ROOT_API + '/energy/images/' + value + '\')'
      } else {
        this.$refs.main.style.backgroundColor = 'rgb(26,26,26)'
      }
    }
  },
  mounted () {
    this.$refs.main.style.backgroundImage = ''
    if (this.media) {
      this.$refs.main.style.backgroundImage = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.7),  rgba(0, 0, 0, 0.2)),url(\'' + process.env.VUE_APP_ROOT_API + '/energy/images/' + this.media + '\')'
    } else {
      this.$refs.main.style.backgroundColor = 'rgb(26,26,26)'
    }
  }

}
</script>
<style scoped>
  .stage {
    position: relative !important;
    top: 0 !important;
    left: 0 !important;
    padding: 0;
    margin: 0;
    height: 200px !important;
  }
  .main {
    padding: 0;
  }
  .background {
    position: absolute;
    top: 0px;
    left: 0px;
    height: 100%;
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
