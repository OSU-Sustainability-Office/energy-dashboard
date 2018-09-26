<template>
  <div class="card featured" v-bind:class="{ feature : featured}" ref='card'>
    <div class='titleTextFeatured personalTitle row' ref='title'>
      <div class='col'>{{block(index).name}}</div>
      <i class="col-1 text-right fas fa-pencil-alt" @click='$parent.editModal(index)' v-b-tooltip.hover title='Edit Block'></i>
    </div>
    <!-- <div class='titleTextFeatured' v-if="story.public">
      {{block(index).name}}

    </div> -->
    <chartController :index='index' :graphType='block(index).graph_type' ref="chartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': '100%','height': '100%', 'padding-right': '0.5em','padding-left':'0.5em','padding-top':'1em' }" :height='520'/>
    <!-- <featureController :index='index' v-if="featured" ref="featureController" /> -->

    <b-modal lazy size='lg' v-model='editcard' title='Edit Block' body-bg-variant="light" header-bg-variant="light" footer-bg-variant="light">
      <b-container>
        <div class="row form-group" v-if='!story.public'>
          <label class='col-4'>Name:</label>
          <el-input type="text" v-model='tempName' class='col'></el-input>
        </div>
        <div class='row form-group'>
          <label class='col-4 text-left'>From Date: </label>
          <el-date-picker class='col' v-model='date_start' type='datetime' format='MM/dd/yyyy hh:mm a' :picker-options="{ format: 'hh:mm a'}" value-format='yyyy-MM-ddTHH:mm:00.000Z'>
          </el-date-picker>
        </div>
        <div class='row form-group'>
          <label class='col-4 text-left'>To Date: </label>
          <el-date-picker class='col' v-model='date_end' type='datetime' format='MM/dd/yyyy hh:mm a' :picker-options="{ format: 'hh:mm a'}" value-format='yyyy-MM-ddTHH:mm:00.000Z'>
          </el-date-picker>
        </div>
        <div class='row form-group'>
          <label class='col-4'>Interval: </label>
          <el-select class='col' v-model="intunit" >
            <el-option :value="1" label='15 Minutes'></el-option>
            <el-option :value="2" label='1 Hour'></el-option>
            <el-option :value="3" label='1 Day'></el-option>
            <el-option :value="4" label='1 week'></el-option>
            <el-option :value="5" label='1 Month'></el-option>
          </el-select>
        </div>
        <div class="row form-group" v-if='!story.public'>
          <label class='col-4'>Graph Type: </label>
          <el-select v-model="graphtype" class='col'>
            <el-option :value='1' label='Line Chart'></el-option>
            <el-option :value='2' label='Bar Chart'></el-option>
            <el-option :value='3' label='Doughnut Chart'></el-option>
          </el-select>
        </div>
        <div class='row form-group'>
          <label class='col' v-if='!story.public'>Datasets: </label>
          <featureController :index='index' ref="featureController" class='container-fluid controlSection' />
        </div>
      </b-container>
      <b-container slot='modal-footer'>
        <div class='row'>
          <div class='col-6'>
            <b-btn @click='cardSave()' variant='primary'> Ok </b-btn>
            <b-btn @click='editcard = false'> Cancel </b-btn>
          </div>
          <div class='col text-right' v-if='!story.public'>
            <b-btn @click='cardDelete()' variant='danger'> Delete Block</b-btn>
          </div>
        </div>
      </b-container>
    </b-modal>
  </div>
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
      graphtype: 1
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
  },
  watch: {
    editcard: function (v) {
      if (v) {
        this.tempName = this.block(this.index).name
        this.interval = this.block(this.index).date_interval
        this.interval_unit = this.block(this.index).interval_unit
        this.date_start = this.block(this.index).date_start
        this.date_end = this.block(this.index).date_end
        this.graphtype = this.block(this.index).graph_type
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
  margin-left: 0.5%;
  margin-right: 0.5%;
  margin-top: 1em;
  border: 2px solid #000;
  border-radius: 5px;
  height: 10em;

  overflow: hidden;
  width: 250px;
}
.col {
  margin: 0em;
}
.feature {
  background: #000;
  height: 40em;
  padding-right: 2em;
  padding-left: 2em;
  width: 100%;
  flex: 1 1 49%;
}
.titleTextFeatured {
  color: rgb(215,63,9);
  font-size: 2em;
  font-family: 'StratumNo2';
  padding-top: 0.3em;
}
.personalTitle {
  cursor: pointer;
}
.descriptionTextFeatured {
  color: rgb(255,255,255);

}
.fas {
  color: #FFFFFF99;
  padding-top: 0.2em;
  font-size: 0.9em;
  width: 100%;
  cursor: pointer;
}
.storyName {
  color:rgb(215,63,9);
  font-family: 'StratumNo2';
  font-size: 1.8em;
  display: block;
}
.storyCard {
  padding: 1em;
  border: 2.5px solid rgb(215,63,9);
  height: 100%;
  width: 100%;
}
.storyDescription {
  color: #FFF;
  font-family: 'StratumNo2';
  font-size: 1.2em;
  display: block;
  padding-left: 0.3em;
}
.top-pad {
  padding-top: 0.5em;
}
</style>
