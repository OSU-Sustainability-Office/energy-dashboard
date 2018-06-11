<template>
  <div class="card" v-bind:class="{ feature : featured }">
    {{this.name}}, {{this.description}} {{this.featured}}
    <!-- <linechart v-if="featured" ref="chart" v-bind:chartData="chartDataComplete" :style="{ display: 'inline-block', width: '100%' }"/> -->
    <!-- <linechart v-else ref="chart" v-bind:chartData="data" /> -->
    <chartController v-if="featured" ref="chartController" />
    <featureController v-if="featured" />
  </div>
</template>

<script>

import chartController from '@/components/charts/chartController'
import axios from 'axios';
import featureController from '@/components/account/featureController'


export default {
  name: 'card',
  props: ['name', 'description', 'featured', 'id'],
  components: {
    chartController, featureController
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
  margin-right: 1em;
  margin-top: 1em;
  border: 2px solid #000;
  border-radius: 5px;
  height: 10em;
  min-width: 15em;
}
.feature {
  background: #000;
  height: 30em;
  padding-right: 2em;
  padding-left: 2em;
  width: 100%;
}
</style>
