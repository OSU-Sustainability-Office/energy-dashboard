<template>
  <el-container class='stage'>
    <el-main class="background">
      <el-row>
        <homeContent />
      </el-row>
      <el-row class='side'>
        <homeSide />
      </el-row>
      <el-row class="buttonBox">
          <el-col :span='6'>
            &nbsp;
          </el-col>
          <el-col :span='5'>
            <el-button type='primary' class='home-button' @click="explore()">Explore</el-button>
          </el-col>
          <el-col :span='2'>
            &nbsp;
          </el-col>
          <el-col :span='5' v-if='user.name === ""'>
              <el-button type='primary' class='home-button' @click="login()">Login</el-button>
          </el-col>
          <el-col :span='6'>
            &nbsp;
          </el-col>
      </el-row>
    </el-main>
  </el-container>
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
<style scoped lang='scss'>
@import '@/assets/style-variables.scss';

.stage {
  position: relative;
  top: 0;
  left: 0;
  height: calc(100vh - #{$--nav-height});
  width: 100%;
}
.background {
  background: url('/static/images/solar.jpg');
  background-size: cover;
  background-position: center center;
  position: absolute;
  top: 0;
  left: 0;
  height:100%;
  width: 100%;
  z-index: 0;
}
.side {
  padding-top: 1em;
}
.buttonBox {
  padding-top: 2em;
}
.home-button {
  width: 100%;
  border: solid 1px $--color-white;
}
.home-button:hover {
  border: solid 1px $--color-white;
}
.home-button:active {
  border: solid 1px $--color-white;
}
</style>
