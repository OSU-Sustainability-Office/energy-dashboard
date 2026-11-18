<!--
  Filename: NavigationBar.vue
  Info: Primary navigation bar shown on top of all pages.
-->
<template>
  <div>
    <div class="nav-menu">
      <div class="nav-content">
        <div class="logo"><svgLogo width="190px" alt="" @click="$router.push({ path: '/map' })" /></div>
        <CampusSwitcher class="nav-campus" />
        <span class="nav-divider" aria-hidden="true"></span>
        <ul ref="navItems" class="nav-items">
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
    </div>
  </div>
</template>

<script>
import svgLogo from '/src/assets/icons/logo.svg'
import CampusSwitcher from '@/components/ui/CampusSwitcher.vue'

// Width of the fade on the links' right edge at phone width (see the styles).
const FADE_WIDTH = 24

export default {
  components: {
    svgLogo,
    CampusSwitcher
  },
  data() {
    return {
      showMobileMenu: false
    }
  },
  watch: {
    $route() {
      this.$nextTick(this.revealActiveLink)
    }
  },
  methods: {
    showMenu() {
      this.showMobileMenu = !this.showMobileMenu
    },
    // On a phone the links scroll sideways, so opening e.g. /contact directly
    // would leave the current page's pill out of view. Scrolls only the link
    // strip (scrollIntoView would move the page too), and is a no-op when the
    // links all fit.
    revealActiveLink() {
      const items = this.$refs.navItems
      const active = items?.querySelector('.router-link-active')
      if (!active) {
        return
      }
      const link = active.getBoundingClientRect()
      const strip = items.getBoundingClientRect()
      if (link.right > strip.right) {
        // Clear the fade too, unless that would push the link's start out of view.
        items.scrollLeft += Math.min(link.right - strip.right + FADE_WIDTH, link.left - strip.left)
      } else if (link.left < strip.left) {
        items.scrollLeft -= strip.left - link.left
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.nav-menu {
  background-color: white;
}
/* The links don't pad themselves out to the bar's height, so this sets it --
   from the same variable App.vue and the full-height pages use to clear the bar. */
.nav-content {
  display: flex;
  align-items: center;
  min-height: $nav-height;
  padding: 0px 20px;
  background-color: $color-primary !important;
}
.nav-items {
  display: flex;
  list-style: none;
  margin: 0;
  padding: 0;
  li {
    padding: 0px 2px;
  }
}
i {
  display: none;
  margin-top: 20px;
  margin-left: 5px;
}
/*
  Same vocabulary as CampusSwitcher: StratumNo2, 5px pills and a dark hover tint.
  The current page keeps the bar's original dark fill, just in pill form.
*/
.navLink {
  display: block;
  font-family: 'StratumNo2', sans-serif;
  font-size: 18px;
  line-height: 1;
  padding: 14px 14px;
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
/* Flex rather than a top-padding offset: it drops the inline SVG's baseline gap
   so the logo centres on the bar like the links. */
.logo {
  display: flex;
  cursor: pointer;
}
.nav-campus {
  margin-left: 14px;
}
/* Separates the campus, which scopes every page, from the pages themselves. */
.nav-divider {
  width: 1px;
  height: 28px;
  margin: 0 10px;
  background-color: rgba(255, 255, 255, 0.35);
}
.logo,
.nav-campus {
  flex-shrink: 0;
}
/*
  The full row is ~860px. Below that it tightens up, and on a phone, where even the
  tight row doesn't fit, the links scroll sideways inside the bar. Wrapping isn't an
  option: a second line would make the bar taller than $nav-height and cover the top
  of every page. The fade on the right edge is the only hint that there is more to
  swipe to, since the scrollbar is hidden.
*/
@media only screen and (max-width: 900px) {
  .nav-content {
    padding: 0px 12px;
  }
  .logo svg {
    width: 120px;
  }
  .nav-campus {
    margin-left: 6px;
  }
  .nav-divider {
    display: none;
  }
  .nav-items {
    flex: 1;
    min-width: 0;
    overflow-x: auto;
    scrollbar-width: none;
    mask-image: linear-gradient(to right, #000 calc(100% - 24px), transparent);
    &::-webkit-scrollbar {
      display: none;
    }
  }
  .navLink {
    font-size: 16px;
    padding: 12px 10px;
    white-space: nowrap;
  }
}
</style>
