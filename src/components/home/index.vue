<template>
  <div id="background" class="container-fluid">
    <!-- <div id="background"><div id="shadow"></div></div> -->
    <div class="row">
      <homeContent />
    </div>
    <div class="row">
      <homeSide />
    </div>
    <div class="row buttonBox justify-content-center">
      <div class='col-6'>
        <div class='row'>
          <div class="col">
            <div class="row justify-content-center">
              <b-btn variant='primary' class="col" @click="explore()">Explore</b-btn>
            </div>
          </div>
          <div class="col" v-if='user.name === ""'>
            <div class="row justify-content-center">
              <b-btn variant='primary' class="col" @click="login()">Login</b-btn>
            </div>
          </div>
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
  data () {
    return {
      user: {
        name: '',
        privilege: 0
      }
    }
  },
  mounted () {
    this.$store.dispatch('user').then(r => { this.user = r })
  },
  created () {
  },
  methods: {
    login: function () {
      window.location.href = process.env.ROOT_API + '/auth/login?returnURI=' + process.env.HOST_ADDRESS + '/#/map'
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
  top: 0px;
  width: 100%;
}
#background {
  background: url('static/images/solar.jpg');
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
