/*
 * @Author: you@you.you
 * @Date:   Tuesday December 17th 2019
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Tuesday December 17th 2019
 * @Copyright:  (c) Oregon State University 2019
 */
<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-11-29T12:53:21-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-09T13:35:41-08:00
-->

<template>
  <el-row class="card" ref='card'>
    <el-col :span='24'>
      <el-row class='title' ref='title'>
        <el-col :span='20'>{{ name }}</el-col>
        <el-col :span='4' v-if='personalView || publicView' class='right'>&nbsp;<i class="fas fa-sliders-h" @click='openModal()'></i></el-col>
      </el-row>
      <el-row style='overflow: hidden;'>
        <chartController :randomColors='1' :path='path' ref="chartController"  class="chart" :styleC='style' :height='430'/>
      </el-row>
  </el-col>
  </el-row>
</template>

<script>
import chartController from '@/components/charts/chartController'

export default {
  name: 'card',
  props: ['path'],
  components: {
    chartController
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
        'width': 'calc(100% - 3em)',
        'height': '400px',
        'margin-right': '0.5em',
        'margin-left': '0.5em',
        'padding-right': '1em',
        'padding-left': '1em',
        'padding-top': '1em'
      }
    }
  },
  computed: {
    name: {
      get () {
        let name = this.$store.getters[this.path + '/name']
        if (name && name !== '') {
          return name
        } else {
          return '\xa0'
        }
      }
    },
    personalView: {
      get () {
        return this.path.includes('user')
      }
    },
    publicView: {
      get () {
        return this.path.includes('building')
      }
    },
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
        } else {
          return 1
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
    openModal: function () {
      this.$store.dispatch('modalController/openModal', {
        name: 'edit_card',
        path: this.path
      })
    },
    cardSave: async function () {
      // this.editcard = false
      // let charts = await this.$refs.featureController.saveCharts()
      // let block = {
      //   name: this.tempName,
      //   index: this.index,
      //   date_interval: this.interval,
      //   interval_unit: this.interval_unit,
      //   date_start: this.date_start,
      //   date_end: this.date_end,
      //   graph_type: this.graphtype,
      //   charts: charts
      // }
      // this.$store.dispatch('block', block).then(() => {
      //   this.$refs.chartController.parse()
      // })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.card {
  background-color: $--color-white;
  padding: 2em;
  height: calc(400px + 8em);
  color: $--color-primary;
  margin-top: 1em;
  margin-bottom: 1em;
  border-radius: 5px;
  box-shadow: 0px 0px 3px $--color-black;
}
.title {
  font-family: 'StratumNO2';
  font-size: 2em;
  padding-bottom: 0.35em;
}
.title .fas {
  transition: color 0.2s ease;
  cursor: pointer;
}
.title .fas:hover {
  color: $--color-black;
}
.right {
  text-align: right;
}

</style>
