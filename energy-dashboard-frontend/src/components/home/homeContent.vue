<template>
  <div id="home-content">
    <h2>Commited to:</h2>
    <commitment />
  </div>

</template>

<script>
import commitment from '@/components/home/commitment'

export default {
  name: 'homeContent',
  components: {
    commitment
  }
}
</script>

<style>
#home-content {
  color: #fff;
  font-family: 'StratumNo2';
  font-size: 10em;
  position: absolute;
  background: linear-gradient( rgba(0,0,0,1), rgba(0,0,0,0));
  width: 100%;
  height: 100%;
}
h2 {
  padding: 0px;
  padding-left: .1em;
  margin: 0px;
  margin-bottom: -.50em;
  font-size: .4em;
}
</style>
