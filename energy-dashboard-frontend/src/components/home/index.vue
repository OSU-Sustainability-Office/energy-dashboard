<template>
  <div class="background">
    <homeContent />
    <homeSide />
    <exploreBtn />
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
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.background {
  background: url('/static/images/solar.jpg');
  box-shadow: inset 0 0 0 1000px rgba(0,0,0,.2);
  background-size: cover;
  top: 4em;
  bottom: 0px;
  position: absolute;
  width: 100%;
}
</style>
