<template>
  <div id="center">
    <h2 class="highlight">COMMITTED TO:</h2>
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
.highlight {
  /* color: #D73F09;
  background-color: rgba(255,255,255,0.8); */
}
#center {
  color: #fff;
  font-family: 'StratumNo2';
  font-size: 5.5em;
  align-content: center;
  height: 2.5em;
  /* background-color: rgba(0,0,0,0.8); */
  width: 100%;
  padding-top: 0.5em;

}
@media screen and (max-width: 900px) {
  #center {
     font-size: 60px;
  }
  .highlight {
    font-size: 20px;
  }
}
@media screen and (max-width: 575px) {
  #center {
     font-size: 30px;
  }
  .highlight {
    font-size: 18px;
  }
}
</style>
