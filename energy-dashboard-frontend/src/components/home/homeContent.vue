<template>
  <div id="center">
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
#center {
  color: #fff;
  font-family: 'StratumNo2';
  font-size: 6em;
  align-content: center;
}
</style>
