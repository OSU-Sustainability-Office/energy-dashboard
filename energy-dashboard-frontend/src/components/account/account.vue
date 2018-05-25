<template>
  <div class="background">
    <span class="main-heading">Stories</span>
    <carousel />
    <span class="main-heading">Featured Blocks</span>
    <featured />
  </div>
</template>

<script>
import carousel from '@/components/account/carousel'
import featured from '@/components/account/featured'

export default {
  name: 'account',
  components: {
    carousel,
    featured
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.background {
  background: #fff;
  top: 4em;
  bottom: 0px;
  position: absolute;
  width: 100%;
}
.main-heading {
  font-size: 3em;
  margin-left: .3em;
}
</style>
