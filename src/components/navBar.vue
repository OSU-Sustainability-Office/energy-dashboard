<template>
  <div>
    <div class="nav-menu">
      <i class="fas fa-bars" @click="showMenu()"> </i>
      <div class="nav-content" :class="this.showMobileMenu ? 'open-menu' : 'closed-menu'">
        <div class="logo"><svgLogo width="160px" alt="" @click="$router.push({ path: '/map' })" /></div>
        <ul class="nav-items">
          <li class="navLi"><a href="/#/map" class="navLink" rel="noreferrer" @click="showMenu()"> Map </a></li>
          <li class="navLi">
            <a href="/#/buildings" class="navLink" rel="noreferrer" @click="showMenu()"> Building List </a>
          </li>
          <li class="navLi">
            <a href="/#/campaigns" class="navLink" rel="noreferrer" @click="showMenu()"> Campaigns </a>
          </li>
          <li class="navLi">
            <a href="/#/getstarted" class="navLink" rel="noreferrer" @click="showMenu()"> Get Started </a>
          </li>
          <li class="navLi"><a href="/#/contact" class="navLink" rel="noreferrer" @click="showMenu()"> Contact </a></li>
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
  padding: 5px 20px;
  align-items: left;
  padding-top: 10px;
  left: 10px;
  background-color: $--color-primary !important;
}
.nav-items {
  display: flex;
  justify-content: center;
  align-items: left;
  list-style: none;
  margin: 0;
  padding-top: 18px;
  li {
    padding: 0 10px;
  }
}
i {
  display: none;
  margin-top: 20px;
  margin-left: 5px;
}
.navLi {
  padding-top: 10px;
}
.navLink {
  color: white;
  margin-top: 10px;
  font-size: 16px;
}

// Mobile version - hidden hamburger menu
@media screen and (max-width: 844px) {
  .nav-menu {
    padding-left: -200;
    padding-bottom: -20;
    top: -20px;
    position: absolute;
    width: 100%;
    background-color: $--color-primary !important;
  }
  .open-menu {
    opacity: 1;
    height: 180px;
  }
  .closed-menu {
    opacity: 0;
    height: 0px;
    padding: 0;
  }
  .nav-content {
    flex-direction: column;
    z-index: 500;
    position: relative;
    transition: all 0.2s ease-out;
    left: calc(8.5%);
    width: 150px;
    align-items: start;
    top: -25px;
    padding-bottom: 5vh;
    padding-left: 5px;
  }
  .nav-items {
    flex-direction: column;
    align-items: left;
    padding-top: 0px;
    margin-left: -40px;
  }
  i {
    display: block;
    text-align: left;
    padding-left: 10px;
    padding-top: 23px;
  }
}
</style>
