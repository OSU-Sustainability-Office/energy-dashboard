<!--
  Filename: NavigationBar.vue
  Info: Primary navigation bar shown on top of all pages.
-->
<template>
  <div>
    <div class="nav-menu">
      <div class="nav-content">
        <div class="nav-left">
          <div class="logo"><svgLogo width="160px" alt="" @click="$router.push({ path: '/map' })" /></div>
          <ul class="nav-items">
            <li class="navLi"><router-link to="/map" class="navLink">Map</router-link></li>
            <li class="navLi">
              <router-link to="/buildings" class="navLink">Buildings</router-link>
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
        <CampusToggle class="nav-campus" />
      </div>
    </div>
  </div>
</template>

<script>
import svgLogo from '/src/assets/icons/logo.svg'
import CampusToggle from '@/components/ui/CampusToggle.vue'

export default {
  components: {
    svgLogo,
    CampusToggle
  },
  data() {
    return {
      showMobileMenu: false
    }
  },
  methods: {
    showMenu() {
      this.showMobileMenu = !this.showMobileMenu
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-menu {
  background-color: white;
}
/*
  Three columns so the campus toggle sits at the true centre of the bar: the
  outer two share the leftover width equally. A 1fr track never shrinks below
  its content, so on narrow screens the left column holds its ground and the
  toggle slides right rather than overlapping the links.

  The right padding gives back the width of the page's vertical scrollbar
  (100vw - 100%), so the centre stays at the middle of the window and the
  toggle doesn't jump when moving between pages that scroll and pages that don't.
*/
.nav-content {
  display: grid;
  grid-template-columns: 1fr auto 1fr;
  padding: 0px 20px;
  padding-right: max(0px, calc(20px - (100vw - 100%)));
  align-items: left;
  padding-top: 0px;
  left: 10px;
  background-color: $color-primary !important;
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
    padding: 0px 3px;
  }
}
i {
  display: none;
  margin-top: 20px;
  margin-left: 5px;
}
/*
  Same vocabulary as CampusToggle: StratumNo2, 5px pills and its dark hover
  tint. The current page keeps the bar's original dark fill, just in pill form
  -- a solid white fill is reserved for the campus selection so the two never
  read as the same control.
*/
.navLink {
  display: block;
  font-family: 'StratumNo2', sans-serif;
  font-size: 16px;
  line-height: 1;
  padding: 12px 14px;
  border-radius: 5px;
  color: $color-white;
  text-decoration: none;
  transition: background-color 0.15s ease;
}
.navLink:hover:not(.router-link-active) {
  background-color: rgba(0, 0, 0, 0.15);
}
.navLink.router-link-active {
  background-color: rgba(0, 0, 0, 0.3);
}
.navLink:focus-visible {
  outline: 2px solid $color-white;
  outline-offset: -2px;
}
/* The links no longer pad themselves out to the bar's height, so this holds it
   at the 72px it had before. */
.nav-left {
  display: flex;
  align-items: center;
  min-height: 72px;
}
.logo {
  padding-top: 10px;
  cursor: pointer;
}
/*
  .nav-content sets `align-items: left`, which is not a valid value and so
  resolves to stretch -- the toggle sets its own align-self rather than change a
  rule the rest of the bar depends on.
*/
.nav-campus {
  margin: 0 20px;
}
</style>
