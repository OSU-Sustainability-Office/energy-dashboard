<template>
  <div>
  <div class="nav-menu">
  <i 
  class="fas fa-bars" 
  @click="showMenu()"> 
  </i>
  <div
  class="nav-content"
  :class="this.showMobileMenu ? 'open-menu' : 'closed-menu'"
  > // Menu content
  <div class="logo">Logo</div>
  <ul class="nav-items">
  <li>Menu</li>
  <li>About</li>
  <li>Contact</li>
  </ul>
  <div class="login-button">Login</div>
  </div>
  </div>
  </div>
  </template>

<script>
export default {
data() {
return {
showMobileMenu: false,
};
},
methods: {
showMenu() {
this.showMobileMenu = !this.showMobileMenu;
},
},
};
</script>

<style lang="scss" scoped>
.nav-menu {
background-color: white;
}
.nav-content {
display: flex;
justify-content: space-between;
padding: 27px 30px;
align-items: left;
background-color: $--color-primary !important;
}
.nav-items {
display: flex;
justify-content: center;
align-items: left;
list-style: none;
margin: 0;
padding: 0;
li {
padding: 0 10px;
}
}
i {
display: none;
}
// Mobile version - hidden hamburger menu
@media screen and (max-width: 768px) {
.nav-menu {
padding-top: 20px;
padding-left: 20px;
position: absolute;
width: 100%;
background-color: $--color-primary !important;
}
.open-menu {
opacity: 1;
height: 150px;
}
.closed-menu {
opacity: 0;
height: 0;
padding: 0;
}
.nav-content {
flex-direction: column;
z-index: 100;
position: relative;
padding: 27px 30px;
transition: all 0.2s ease-out;
left: -30px
}
.nav-items {
flex-direction: column;
}
i {
display: block;
text-align: left;
padding: 0 10px 10px 0;
}
}
</style>