<template>
  <el-row class="card" ref='card'>
    <el-col :span='24'>
      <el-row class='title' ref='title'>
        <el-col :span='20'>{{block(index).name}}</el-col>
        <el-col :span='4' class='right'><i class="fas fa-sliders-h" @click='$emit("editModal",index)'></i></el-col>
      </el-row>
      <el-row>
        <chartController :randomColors='1' :index='index' :graphType='block(index).graph_type' ref="chartController"  class="chart" :styleC='style' :height='400'/>
      </el-row>
  </el-col>
  </el-row>
</template>

<script>

import chartController from '@/components/charts/chartController'
import featureController from '@/components/account/featureController'
import { mapGetters } from 'vuex'

export default {
  name: 'card',
  props: ['index', 'featured'],
  components: {
    chartController, featureController
  },
  data () {
    return {
      editcard: false,
      tempName: '',
      interval: 15,
      interval_unit: 'minute',
      date_start: '',
      date_end: '',
      graphtype: 1,
      style: {
        'display': 'inline-block',
        'width': '100%',
        'height': '400px',
        'padding-right': '0.5em',
        'padding-left': '0.5em',
        'padding-top': '1em'
      }
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block'
    ]),
    intunit: {
      // 1 15 Minutes
      // 2 1 hour
      // 3 1 Day
      // 4 1 week
      // 5 1 month
      get: function () {
        if (this.interval === 15 && this.interval_unit === 'minute') {
          return 1
        } else if (this.interval === 1 && this.interval_unit === 'hour') {
          return 2
        } else if (this.interval === 1 && this.interval_unit === 'day') {
          return 3
        } else if (this.interval === 7 && this.interval_unit === 'day') {
          return 4
        } else if (this.interval === 1 && this.interval_unit === 'month') {
          return 5
        }
      },
      set: function (v) {
        switch (v) {
          case 1:
            this.interval = 15
            this.interval_unit = 'minute'
            break
          case 2:
            this.interval = 1
            this.interval_unit = 'hour'
            break
          case 3:
            this.interval = 1
            this.interval_unit = 'day'
            break
          case 4:
            this.interval = 7
            this.interval_unit = 'day'
            break
          case 5:
            this.interval = 1
            this.interval_unit = 'month'
            break
        }
      }
    }
  },
  methods: {
    cardSave: async function () {
      this.editcard = false
      let charts = await this.$refs.featureController.saveCharts()
      let block = {
        name: this.tempName,
        index: this.index,
        date_interval: this.interval,
        interval_unit: this.interval_unit,
        date_start: this.date_start,
        date_end: this.date_end,
        graph_type: this.graphtype,
        charts: charts
      }
      this.$store.dispatch('block', block).then(() => {
        this.$refs.chartController.parse()
      })
    },
    cardDelete: function () {
      this.editcard = false
      this.$store.commit('removeBlock', { index: this.index })
      this.$eventHub.$emit('reloadCharts')
      this.$store.commit('modifyFlag')
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
@import '@/assets/style-variables.scss';

.card {
  background-color: $--color-black;
  padding: 2em;
  height: calc(400px + 8em);
  color: $--color-primary;
  margin-top: 1em;
  margin-bottom: 1em;
  border-radius: 5px;
}
.title {
  font-family: 'StratumNO2';
  font-size: 2em;
}
.title .fas {
  transition: color 0.2s ease;
  cursor: pointer;
}
.title .fas:hover {
  color: $--color-white;
}
.right {
  text-align: right;
}

</style>
