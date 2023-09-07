<template>
  <div>
    <div class="nav-menu">
      <div class="nav-content">
        <div class="logo"><svgLogo width="160px" alt="" @click="$router.push({ path: '/map' })" /></div>
        <ul class="nav-items">
          <li class="navLi"><router-link to="/map" class="navLink">Map</router-link></li>
          <li class="navLi">
            <router-link to="/buildings" class="navLink">Building List</router-link>
          </li>
          <li class="navLi">
            <router-link to="/campaigns" class="navLink">Campaigns</router-link>
          </li>
          <li class="navLi">
            <router-link to="/getstarted" class="navLink">FAQ</router-link>
          </li>
          <li class="navLi"><router-link to="/contact" class="navLink">Contact</router-link></li>
        </ul>
      </div>
    </div>
  </div>
</template>

<script>
import svgLogo from '../../public/images/logo.svg'

export default {
  components: {
    svgLogo
  },
  data () {
    return {
      showMobileMenu: false
    }
  },
  methods: {
    showMenu () {
      this.showMobileMenu = !this.showMobileMenu
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-menu {
  background-color: white;
}
.nav-content {
  display: flex;
  justify-content: left;
  padding: 0px 20px;
  align-items: left;
  padding-top: 0px;
  left: 10px;
  background-color: $--color-primary !important;
}
.nav-items {
  display: flex;
  justify-content: center;
  align-items: left;
  list-style: none;
  margin: 0;
  padding-top: 0px;
  margin-left: -30px;
  li {
    padding: 25px 0px;
    padding-right: 10px;
    padding-left: 10px;
  }
}
i {
  display: none;
  margin-top: 20px;
  margin-left: 5px;
}
.navLi {
  padding-top: 28px;
}
.navLink {
  color: white;
  margin-top: 10px;
  font-size: 16px;
}
.router-link-active {
  background-color: rgba(0, 0, 0, 0.3);
  padding-bottom: 25px;
  padding-top: 28px;
  padding-right: 10px;
  padding-left: 10px;
  margin-left: -10px;
  margin-right: -10px;
}
.logo {
  padding-top: 10px;
}
</style>
