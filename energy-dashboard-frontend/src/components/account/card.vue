<template>
  <div class="card" v-bind:class="{ feature : featured }">
    {{this.name}}, {{this.description}} {{this.featured}}
    <!-- <linechart v-if="featured" ref="chart" v-bind:chartData="chartDataComplete" :style="{ display: 'inline-block', width: '100%' }"/> -->
    <!-- <linechart v-else ref="chart" v-bind:chartData="data" /> -->
    <chartController v-if="featured" ref="chartController" :graphType='1' class="chart"/>
    <featureController v-if="featured" ref="featureController" />
  </div>
</template>

<script>

import chartController from '@/components/charts/chartController'
import axios from 'axios';
import featureController from '@/components/account/featureController'


export default {
  name: 'card',
  props: ['name', 'description', 'featured', 'id','start','end','int','unit','type'],
  components: {
    chartController, featureController
  },
  mounted() {
    if (this.featured) {
      this.$refs.featureController.dateFrom = this.start;
      this.$refs.featureController.dateTo = this.end;
      this.$refs.featureController.interval = this.int;
      this.$refs.featureController.graphType = this.type;
      this.$refs.featureController.unit = this.unit;

      this.$refs.chartController.start = this.start;
      this.$refs.chartController.end = this.end;
      this.$refs.chartController.interval = this.int;
      this.$refs.chartController.graphType = this.type;
      this.$refs.chartController.unit = this.unit;

      axios.get('http://localhost:3000/api/getBlockMeterGroups?id='+this.id).then (res => {
        //this.$refs.chartController = res.data;
        for (var i = 0; i < res.data.length; i++) {
          this.$refs.featureController.points.push(res.data[i].point);
          this.$refs.featureController.groupids.push(res.data[i].group_id);
          this.$refs.featureController.names.push(res.data[i].name);

          this.$refs.chartController.points.push(res.data[i].point);
          this.$refs.chartController.groups.push(res.data[i].group_id);

          //Need to update the graph right here
        }
      });
    }
  }
  // watch: {
  //
  // }
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
  overflow: hidden;
}
.feature {
  background: #000;
  height: 30em;
  padding-right: 2em;
  padding-left: 2em;
  width: 100%;
}
</style>
