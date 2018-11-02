<template>
  <el-container class='stage'>
    <el-main class='main'>
      <div  class="background" ref='main'>
        <div class='title'>{{name}}</div>
        <div class='subtitle'>{{description}}</div>
      </div>
    </el-main>
  </el-container>
</template>
<script>

export default {
  name: 'heropicture',
  props: ['media', 'name', 'description'],
  watch: {
    media: function (value) {
      this.$refs.main.style.backgroundImage = ''
      if (value) {
        this.$refs.main.style.backgroundImage = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.7),  rgba(0, 0, 0, 0.2)),url(\'' + process.env.ROOT_API + '/energy/images/' + value + '\')'
      } else {
        this.$refs.main.style.backgroundColor = 'rgb(26,26,26)'
      }
    }
  },
  mounted () {
    this.$refs.main.style.backgroundImage = ''
    if (this.media) {
      this.$refs.main.style.backgroundImage = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.7),  rgba(0, 0, 0, 0.2)),url(\'' + process.env.ROOT_API + '/energy/images/' + this.media + '\')'
    } else {
      this.$refs.main.style.backgroundColor = 'rgb(26,26,26)'
    }
  }

}
</script>
<style scoped>
  .stage {
    position: relative;
    top: 0;
    left: 0;
    padding: 0;
    margin: 0;
    height: 200px;
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
