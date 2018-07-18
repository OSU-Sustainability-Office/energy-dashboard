<template>
  <div id="background" class="container-fluid">
    <!-- <div id="background"><div id="shadow"></div></div> -->
    <div class="row">
      <homeContent />
    </div>
    <div class="row">
      <homeSide />
    </div>
    <div class="row justify-content-center buttonBox">
      <!-- <div class="col-sm-2">
        <btn @click="explore()">Explore</btn>
      </div> -->
      <div class="col-sm-2">
        <btn @click="login()">Login</btn>
      </div>
    </div>
  </div>
</template>

<script>
import homeContent from '@/components/home/homeContent'
import homeSide from '@/components/home/homeSide'
import exploreBtn from '@/components/home/exploreBtn'

export default {
  name: 'index',
  components: {
    homeContent,
    homeSide,
    exploreBtn
  },
  methods: {
    login: function() {
      window.location.href=process.env.ROOT_API+"energy";
      //this.$router.push("account")
    },
    explore: function() {
      this.$router.push("story/1")
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.container-fluid {
  padding: 0px;
}
.buttonBox {
  padding-top: 10px;
}
.row {
  margin: 10px;
}
.btn {
  background-color: #D73F09;
  color: #FFFFFF;
  top: 0px;
  width: 100%;
}
#background {
  background: url('/static/images/solar.jpg');
  background-size: cover;
  background-position: center center;
  top: 4em;
  bottom: 0px;
  width: 100%;
  position: absolute;
  z-index: 0;
}
#shadow {
  position: absolute;
  top: 0px;
  bottom: 0px;
  width: 100%;
  background: linear-gradient( rgba(0,0,0,1), rgba(0,0,0,0));
  z-index: 0;
}
</style>
