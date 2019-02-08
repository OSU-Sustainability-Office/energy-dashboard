<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-17T14:07:35-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-04T11:36:10-08:00
-->

<template>
<el-row class='stage'>
<el-col :span='1'>
  &nbsp;
</el-col>
<el-col class='main' ref="feature" :span='22'>
    <card v-for="(card, index) in story.blocks" v-bind:key="index" v-bind:index="index" ref="displayedCards" @editModal='editModal'/>

    <div class="addFeatured" v-if='user.id === story.user_id' key="add" @click="addFeature()">
      <i class="fas fa-plus"></i>
      <div class='hiddenAddChart'>Click To Add Block</div>
    </div>

  <el-dialog size='lg' :visible.sync='newCard' :title='(!form.name)? "New Block" : "Edit Block"' width="80%">
      <el-form label-width='120px' label-position='left' :model='form' ref='form'>
        <el-form-item label='Name: ' v-if='!story.public' :rules="{required: true, message: 'A name is required', trigger: 'blur'}" prop='name'>
          <!-- <label class='col-4'>Name:</label> -->
          <el-input type="text" v-model='form.name' style='width: 100%;'></el-input>
        </el-form-item>
        <el-form-item label='From Date: ' :rules="[{validator: dateValidator, type: 'date', required: true, message: 'A from date is required', trigger: 'change'}]" prop='start'>
          <!-- <label class='col-4 text-left'>From Date: </label> -->
          <el-date-picker v-model='form.start' type='datetime' format='MM/dd/yyyy hh:mm a' :picker-options="{ format: 'hh:mm a' }" style='width: 100%;'>
          </el-date-picker>
        </el-form-item>
        <el-form-item label='To Date: ' :rules="{validator: dateValidator, type: 'date', required: true, message: 'A to date is required', trigger: 'change'}" prop='end'>
          <!-- <label class='col-4 text-left'>To Date: </label> -->
          <el-date-picker v-model='form.end' type='datetime' format='MM/dd/yyyy hh:mm a' :picker-options="{ format: 'hh:mm a'}" style='width: 100%;'>
          </el-date-picker>
        </el-form-item>
        <el-form-item label='Interval: ' :rules="{required: true, message: 'An interval is required', trigger: 'blur'}" prop='intUnit'>
          <!-- <label class='col-4'>Interval: </label> -->
          <el-select v-model="form.intUnit" style='width: 100%;'>
            <el-option :value="1" label='15 Minutes'></el-option>
            <el-option :value="2" label='1 Hour'></el-option>
            <el-option :value="3" label='1 Day'></el-option>
            <el-option :value="4" label='1 week'></el-option>
            <el-option :value="5" label='1 Month'></el-option>
          </el-select>
        </el-form-item>
        <el-form-item v-if='!story.public' label='Graph Type: ' :rules="{required: true, message: 'A graph type is required', trigger: 'blur'}" prop='graphType'>
          <!-- <label class='col-4'>Graph Type: </label> -->
          <el-select v-model="form.graphType" style='width: 100%;'>
            <el-option :value='1' label='Line Chart'></el-option>
            <el-option :value='2' label='Bar Chart'></el-option>
            <el-option :value='3' label='Doughnut Chart'></el-option>
          </el-select>
        </el-form-item>
      </el-form>
      <div v-if='!story.public'>
        <label>Datasets: </label>
        <featureController :index='form.index' :key='form.index' ref="featureController" />
      </div>
      <featureController v-if='story.public && !compareMode' :index='story.blocks.length' :key='story.blocks.length' ref="featureController" />
      <span slot='footer'>
            <el-button @click='cardDelete()' v-if='!story.public' type='danger'> Delete </el-button>
            <el-button @click='cardSave()' type='primary'> Ok </el-button>
            <el-button @click='cancel()' type='info'> Cancel </el-button>
      </span>
  </el-dialog>
</el-col>
</el-row>
</template>

<script>
import card from '@/components/account/card'
import featureController from '@/components/account/featureController'
import { mapGetters } from 'vuex'

export default {
  name: 'featured',
  components: {
    card,
    featureController
  },
  props: ['cards', 'fromMap', 'compareMode'],
  data () {
    return {
      dialogVisible: false,
      isMinimized: false,
      update: 0,
      form: {
        start: null,
        end: null,
        intUnit: null,
        graphType: null,
        name: null,
        index: null,
        id: null
      },

      newCard: false
    }
  },
  computed: {
    ...mapGetters([
      'user',
      'story',
      'block'
    ])
  },
  methods: {
    updateCards: function () {
      if (this.$refs.displayedCards && this.$refs.displayedCards.length >= 1) {
        for (let card of this.$refs.displayedCards) {
          card.$refs.chartController.parse()
        }
      }
    },
    dateValidator: function (rule, value, callback) {
      if (!value) {
        callback(new Error(rule.message))
      } else {
        callback()
      }
    },
    cardDelete: function () {
      this.newCard = false
      this.$store.commit('removeBlock', { index: this.form.index })
      this.$eventHub.$emit('reloadCharts')
    },
    cardSave: function () {
      let validators = []
      if (this.$refs.featureController) {
        validators.push(this.$refs.featureController.$refs.form.validate())
      }
      validators.push(this.$refs.form.validate())
      Promise.all(validators).then(async r => {
        this.newCard = false
        let card = {
          name: this.form.name,
          date_start: this.form.start.toISOString(),
          date_end: this.form.end.toISOString(),
          date_interval: this.interval(this.form.intUnit),
          interval_unit: this.unit(this.form.intUnit),
          story_id: this.story.id,
          index: this.form.index,
          graph_type: this.form.graphType,
          id: this.form.id
        }
        if (this.$refs.featureController) {
          card.charts = []
          for (const chart of this.$refs.featureController.form) {
            const meters = await this.$store.dispatch('buildingMeters', { id: chart.group })
            const newChart = {
              id: chart.id,
              name: chart.name,
              group_id: chart.group,
              point: chart.point,
              meters: [],
              meter: chart.meter
            }
            if (chart.meter === 0) {
              newChart.meters = newChart.meters.concat(meters.filter(e => e.type === 'e'))
            } else {
              newChart.meters = newChart.meters.concat(meters.filter(e => e.meter_id === chart.meter))
            }
            card.charts.push(newChart)
          }
        }
        this.$store.dispatch('block', card).then(() => {
          this.$refs.displayedCards[this.form.index].$refs.chartController.parse()
        })
      }).catch(() => {})
    },
    interval: function (i) {
      switch (i) {
        case 1:
          return 15
        case 2:
          return 1
        case 3:
          return 1
        case 4:
          return 7
        case 5:
          return 1
      }
    },
    unit: function (i) {
      switch (i) {
        case 1:
          return 'minute'
        case 2:
          return 'hour'
        case 3:
          return 'day'
        case 4:
          return 'day'
        case 5:
          return 'month'
      }
    },
    addFeature: function () {
      this.form.name = null
      this.form.end = null
      this.form.start = null
      this.form.intUnit = null
      this.form.graphType = null
      this.form.id = null
      this.form.index = this.story.blocks.length
      this.newCard = true
      if (this.$refs.featureController) {
        this.$nextTick(() => {
          this.$refs.featureController.form = [{
            name: null,
            meter: null,
            point: null,
            group: null,
            id: null
          }]
        })
      }
    },
    reverseInt: function (unit, interval) {
      if (interval === 15 && unit === 'minute') {
        return 1
      } else if (interval === 1 && unit === 'hour') {
        return 2
      } else if (interval === 1 && unit === 'day') {
        return 3
      } else if (interval === 7 && unit === 'day') {
        return 4
      } else if (interval === 1 && unit === 'month') {
        return 5
      }
    },
    cancel: function () {
      this.form.name = null
      this.form.end = null
      this.form.start = null
      this.form.intUnit = null
      this.form.graphType = null
      this.form.id = null
      this.form.index = 0
      if (this.$refs.featureController) {
        this.$refs.featureController.form = [{
          name: null,
          meter: null,
          point: null,
          group: null,
          id: null
        }]
      }

      this.newCard = false
    },
    editModal: function (index) {
      this.form.name = this.block(index).name
      this.form.end = new Date(this.block(index).date_end)
      this.form.start = new Date(this.block(index).date_start)
      this.form.intUnit = this.reverseInt(this.block(index).interval_unit, this.block(index).date_interval)
      this.form.graphType = this.block(index).graph_type
      this.form.id = this.block(index).id
      this.form.index = index
      this.newCard = true
      this.$nextTick(() => {
        this.$refs.featureController.form = []
        this.$refs.featureController.key = index
        for (const chart of this.block(index).charts) {
          const newChart = {
            meter: chart.meter,
            name: chart.name,
            group: chart.group_id,
            point: chart.point,
            id: chart.id
          }
          this.$refs.featureController.form.push(newChart)
        }
      })
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.stage {
  position: relative !important;
  top: 0 !important;
  height: auto
}
.addFeatured {
  background-color: $--color-black;
  height: calc(400px + 0.8em);
  color: $--color-primary;
  margin-top: 0.1em;
  margin-bottom: 0.1em;
  border-radius: 5px;
  text-align: center;
  font-size: 10em;
  cursor: pointer;
}
.addFeatured .fas {
  margin-top: 1em;
}
.addFeatured:hover {
  border: solid 1px $--color-primary;
  outline: solid 3px $--color-primary;
  outline-offset: -4px;
}
.addFeatured:hover .fas {
  color: $--color-white;
}
.hiddenAddChart {
  display: none;
  font-size: 0.2em;
}
.addFeatured:hover .hiddenAddChart {
  display: block;
}
.addFeatured:hover {
  color: #C72F09;
}
.addFeatured:active {
  color: #d76740;
}

</style>
