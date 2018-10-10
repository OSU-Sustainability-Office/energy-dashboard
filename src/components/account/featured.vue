<template>
<div class="flexFeature" v-bind:class="{ minimized : isMinimized }" ref="feature" :key='update'>
  <!-- <transition-group name="cardEntry" tag="div" class="flexFeature" v-bind:class="{ minimized : isMinimized }" ref="feature"> -->
    <card v-if='$parent.fullyMounted' v-for="(card, index) in story.blocks" v-bind:key="index" v-bind:class="[index === 0 ? 'fullWidth' : 'fullWidth']" v-bind:index="index" :featured="true" ref="displayedCards"/>

    <div class="addFeatured" v-if='user.id === story.user_id' key="add" @click="addFeature()" v-bind:class="[isFull() ? 'fullAdd' : 'smallAdd']">
      +
    </div>
  <!-- </transition-group> -->

  <b-modal lazy size='lg' v-model='newCard' :title='(!newCard.name)? "New Block" : "Edit Block"' body-bg-variant="light" header-bg-variant="light" footer-bg-variant="light">
    <b-container>
      <el-form label-width='120px' label-position='left' :model='form' ref='form'>
        <el-form-item label='Name: ' v-if='!story.public' :rules="{required: true, message: 'A name is required', trigger: 'blur'}" prop='name'>
          <!-- <label class='col-4'>Name:</label> -->
          <el-input type="text" v-model='form.name' style='width: 100%;'></el-input>
        </el-form-item>
        <el-form-item label='From Date: ' :rules="{required: true, message: 'A from date is required', trigger: 'blur'}" point='start'>
          <!-- <label class='col-4 text-left'>From Date: </label> -->
          <el-date-picker v-model='form.start' type='datetime' format='MM/dd/yyyy hh:mm a' :picker-options="{ format: 'hh:mm a'}" value-format='yyyy-MM-ddTHH:mm:00.000Z' style='width: 100%;'>
          </el-date-picker>
        </el-form-item>
        <el-form-item label='To Date: ' :rules="{required: true, message: 'A date to is required', trigger: 'blur'}" point='end'>
          <!-- <label class='col-4 text-left'>To Date: </label> -->
          <el-date-picker v-model='form.end' type='datetime' format='MM/dd/yyyy hh:mm a' :picker-options="{ format: 'hh:mm a'}" value-format='yyyy-MM-ddTHH:mm:00.000Z' style='width: 100%;'>
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
      <div class='row form-group' v-if='!story.public'>
        <label class='col'>Datasets: </label>
        <featureController :index='story.blocks.length' ref="featureController" class='container-fluid' />
      </div>
      <featureController v-if='story.public' :index='story.blocks.length' ref="featureController" />
    </b-container>
    <b-container slot='modal-footer'>
      <div class='row'>
        <div class='col'>
          <b-btn @click='cardSave()' variant='primary'> Ok </b-btn>
          <b-btn @click='newCard = false'> Cancel </b-btn>
        </div>
      </div>
    </b-container>
  </b-modal>
</div>
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
  props: ['cards', 'fromMap'],
  data () {
    return {
      isMinimized: false,
      update: 0,
      form: {
        start: null,
        end: null,
        intUnit: null,
        graphType: null,
        name: null
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
      if (this.$refs.displayedCards && this.$refs.displayedCards.length > 1) {
        for (let card of this.$refs.displayedCards) {
          card.$refs.chartController.parse()
        }
      }
    },
    cardSave: function () {
      let validators = []
      validators.push(this.$refs.featureController.$refs.form.validate())
      validators.push(this.$refs.form.validate())
      Promise.all(validators).then(async (r) => {
        const card = {
          name: this.form.name,
          date_start: this.form.start,
          date_end: this.form.end,
          date_interval: this.interval(this.form.intUnit),
          interval_unit: this.unit(this.form.intUnit),
          charts: [],
          story_id: this.story.id,
          index: this.form.index,
          graph_type: this.form.graphType,
          id: null
        }
        for (const chart of this.$refs.featureController.form) {
          const meters = await this.$store.dispatch('buildingMeters', { id: chart.group })
          const newChart = {
            name: chart.name,
            group_id: chart.group,
            point: chart.point,
            meters: []
          }
          if (chart.meter === 0) {
            newChart.meters = newChart.meters.concat(meters.filter(e => e.type === 'e'))
          } else {
            newChart.meters.push(meters.find(e => e.meter_id === chart.meter))
          }
          card.charts.push(newChart)
        }
        this.$store.dispatch('block', card).then(() => {
          this.newCard = false
          this.$refs.displayedCards[this.form.index].$refs.chartController.parse()
        })
      }).catch(() => {})
    },
    isFull: function () {
      if (this.story.blocks.length === 0) {
        return true
      }
      return (this.story.blocks.length % 2 === 1)
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
      this.form.index = this.story.blocks.length
      this.newCard = true
      this.$nextTick(() => {
        this.$refs.featureController.form = [{
          name: null,
          meter: null,
          point: null,
          group: null
        }]
      })
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
    editModal: function (index) {
      this.form.name = this.block(index).name
      this.form.end = this.block(index).date_end
      this.form.start = this.block(index).date_start
      this.form.intUnit = this.reverseInt(this.block(index).interval_unit, this.block(index).date_interval)
      this.form.graphType = this.block(index).graph_type
      this.form.index = index
      this.newCard = true
      this.$nextTick(() => {
        this.$refs.featureController.form = []
        for (const chart of this.block(index).charts) {
          const newChart = {
            meter: (chart.meters.length > 1) ? 0 : chart.meters[0].meter_id,
            name: chart.name,
            group: chart.group_id,
            point: chart.point
          }
          this.$refs.featureController.form.push(newChart)
        }
      })
    }
  }

}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.flexFeature {
  position: absolute;
  top: 250px;
  display: flex;
  flex-wrap: wrap;
  align-items: center;
  justify-content: flex-start;
  padding-left: 1em;
  padding-right: 1em;
  padding-top: 1em;
  padding-bottom: 1em;
  width: 100%;
  left: 0;
}
.fullWidth {
  width: 100% !important;
  flex-basis: 100% !important;
}
.addFeatured {
  font-size: 4em;
  color: rgb(215,63,9);
  height: 10em;
  flex: 0 60px;
  line-height: 9.8em;
  margin-top: 0.2em;
  margin-right: 0.2em;
  margin-left: 0.2em;
  border: solid 2px #000;
  border-radius: 7px;
  cursor: pointer;
}
.addFeatured:hover {
  color: #C72F09;
}
.addFeatured:active {
  color: #d76740;
}
.fullAdd {
  border-left: none;
  border-radius: 0px 7px 7px 0px;
}
.smallAdd {

  border-right: none;
  border-radius: 7px 0px 0px 7px;
}
.cardEntry-enter-active, .cardEntry-leave-active {
  transition-property: opacity, transform, width;
  transition-duration: 1s;
  backface-visibility: hidden;
}
.cardEntry-leave-active {
  position: relative;
}

/* .page-enter-active {
  transition-delay: 1s;
} */
.cardEntry-enter {
  transform: translateX(1000px);
  opacity: 1;
}
.cardEntry-leave-to {
  transform: translateX(-1000px);
  opacity: 0;
}
.minimized {}
</style>
