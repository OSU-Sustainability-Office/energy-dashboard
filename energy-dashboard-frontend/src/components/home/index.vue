<template>
  <div id="background" class="container-fluid">
    <!-- <div id="background"><div id="shadow"></div></div> -->
    <div class="row">
      <homeContent />
    </div>
    <div class="row">
      <homeSide />
    </div>
    <div class="row buttonBox">
        <div class="col">
          <div class="row justify-content-end">
            <div class="btn col-4" @click="explore()">Explore</div>
          </div>
        </div>
        <div class="col">
          <div class="row justify-content-start">
            <div class="btn col-4" @click="login()">Login</div>
          </div>
        </div>
    </div>
  </div>
</template>

<script>
import homeContent from '@/components/home/homeContent'
import homeSide from '@/components/home/homeSide'

export default {
  name: 'index',
  components: {
    homeContent,
    homeSide
  },
  methods: {
    login: function () {
      window.location.href = process.env.ROOT_API + 'login'
    },
    explore: function () {
      this.$router.push('map')
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
  border: solid 1px #FFF;
}
.btn:hover {
  background-color: #C72F09;
  color: #FFFFFF;
  border: solid 1px #CCC;
}
.btn:active {
  background-color: #d76740;
  color: #FFFFFF;
  border: solid 1px #CCC;
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
