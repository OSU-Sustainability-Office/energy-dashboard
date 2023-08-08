<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-17T14:07:35-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-29T12:25:13-08:00
-->

<template>
  <el-row ref="controlArea">
    <el-row class="pad-bottom" ref="indexChooser" v-if="!story.public">
      <el-col :span="24">
        <el-button
          class="indexButton"
          v-for="(point, index) in this.form"
          :type="buttonVariant(index)"
          @click="changeIndex(index)"
          :key="index"
          >{{ index + 1 }}</el-button
        >
        <el-button class="indexButton" @click="addGroup()">+</el-button>
      </el-col>
    </el-row>
    <el-form ref="form" :model="form[currentIndex]" label-width="120px" size="large" label-position="left">
      <el-form-item
        v-if="!story.public"
        prop="group"
        label="Building: "
        :rules="{
          required: true,
          message: 'A building is required',
          trigger: 'blur'
        }"
      >
        <el-select
          ref="groups"
          v-model="form[currentIndex].group"
          filterable
          placeholder="Building"
          style="width: 100%"
          @change="
            form[currentIndex].meter = 0
            form[currentIndex].point = null
          "
        >
          <el-option v-for="(item, index) in buildings" :key="index" :label="item.name" :value="item.id"></el-option>
        </el-select>
      </el-form-item>
      <el-form-item
        v-if="!story.public && !story.comparison"
        prop="name"
        label="Set Name: "
        :rules="{
          required: true,
          message: 'A set name is required',
          trigger: 'blur'
        }"
      >
        <el-input type="text" v-model="form[currentIndex].name" style="width: 100%"></el-input>
      </el-form-item>

      <el-form-item
        prop="meter"
        v-if="!story.comparison"
        label="Meter: "
        :rules="{
          required: true,
          message: 'A meter is required',
          trigger: 'blur'
        }"
      >
        <el-select
          ref="submeters"
          v-model="form[currentIndex].meter"
          style="width: 100%"
          @change="form[currentIndex].point = null"
        >
          <el-option :value="0" label="All"></el-option>
          <el-option
            v-for="(item, index) in buildingMeters"
            :key="index"
            :label="item.name"
            :value="item.meter_id"
          ></el-option>
        </el-select>
      </el-form-item>

      <el-form-item
        v-if="!story.comparison"
        :rules="{
          required: true,
          message: 'A measurement is required',
          trigger: 'blur'
        }"
        prop="point"
        label="Measurement: "
      >
        <el-select v-model="form[currentIndex].point" style="width: 100%">
          <!-- Meter Measurements -->
          <el-option
            v-for="(point, index) in meterPoints"
            :value="point"
            :label="$store.getters.mapPoint(point)"
            :key="index"
          >
          </el-option>
        </el-select>
      </el-form-item>
    </el-form>
    <el-row class="deletebutton" v-if="this.form.length > 1 && !story.public">
      <el-col :span="10">
        <el-button @click="deleteChart()" type="danger">Delete Dataset</el-button>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'

export default {
  name: 'featureController',
  components: {},
  props: ['index', 'datasets'],
  data () {
    return {
      isMaximized: false,
      currentType: 'e',
      colors: [],
      // This is the charts index, the blocks index is index (really confusing I know, we should change the variable names)
      currentIndex: 0,
      keyPressTimeOut: null,
      mounted: false,
      oldStart: null,
      oldEnd: null,
      test: '',
      points: {},
      meter: [],
      name: [],
      point: [],
      group: [],
      form: []
    }
  },
  created () {
    // Populate Temporary Data
    if ( this.index < this.story.blocks.length ) {
      for ( let chart of this.block( this.index ).charts ) {
        // Name
        this.form.push( {
          name: chart.name,
          meter: chart.meter,
          point: chart.point,
          group: chart.group_id,
          id: chart.id
        } )
      }
    } else {
      this.form = []
      this.form.push( {
        meter: null,
        name: null,
        group: null,
        point: null,
        id: null
      } )
    }
  },
  asyncComputed: {
    buildings: {
      get: function () {
        return this.$store.dispatch( 'buildings' )
      }
    },
    buildingMeters: {
      get: function () {
        if ( this.form.length === 0 ) {
          return
        }
        return this.$store.dispatch( 'buildingMeters', {
          id: this.form[this.currentIndex].group
        } )
      }
    },
    meterPoints: {
      get: function () {
        if ( this.form.length === 0 ) {
          return
        }
        if ( this.form[this.currentIndex].meter ) {
          return this.$store.dispatch( 'meterPoints', {
            id: this.form[this.currentIndex].meter
          } )
        } else {
          return ['accumulated_real']
        }
      }
    }
  },
  computed: {
    ...mapGetters( ['story', 'block'] ),
    step: {
      get: function () {
        if ( this.unit === 'minute' ) {
          return 15
        } else {
          return 1
        }
      }
    }
  },
  watch: {
    currentIndex: function ( value ) {
      this.currentType = this.typeByMeter( this.form[this.currentIndex].meter )
    }
  },
  methods: {
    meters: function ( i ) {
      return new Promise( ( resolve, reject ) => {
        this.$store
          .dispatch( 'buildingMeters', { id: this.group[i] } )
          .then( r => {
            let p = []
            for ( let meter of r ) {
              if ( this.form[i].meter === 0 ) {
                if ( meter.type === 'e' ) {
                  p.push( meter )
                }
              } else {
                if ( this.form[i].meter === meter.meter_id ) {
                  p.push( meter )
                }
              }
            }
            resolve( p )
          } )
          .catch( e => {
            reject( e )
          } )
      } )
    },
    changeIndex: function ( index ) {
      this.$refs.form.validate( valid => {
        if ( valid ) {
          this.currentIndex = index
        }
      } )
    },
    typeByMeter: function ( id ) {
      if ( id === 7 || id === 29 ) {
        return 's'
      } else if ( id === 52 ) {
        return 'g'
      } else {
        return 'e'
      }
    },
    addGroup: function () {
      this.$refs.form.validate( valid => {
        if ( valid ) {
          this.form.push( {
            meter: null,
            group: null,
            name: null,
            point: null
          } )
          this.currentIndex++
        }
      } )
    },
    saveCharts: async function () {
      let r = []
      for ( let i in this.form ) {
        r.push( {
          point: this.form[i].point,
          group_id: this.form[i].group,
          name: this.form[i].name,
          meter: this.form[i].meter,
          meters: await this.meters( i ),
          id: this.form[i].id
        } )
      }
      return r
    },
    buttonVariant: function ( i ) {
      if ( i === this.currentIndex ) {
        return 'primary'
      } else {
        return 'info'
      }
    },
    deleteChart: function () {
      let r = this.form.splice( this.currentIndex, 1 )
      if ( r[0].id ) {
        this.$store.commit( 'removeChart', {
          blockIndex: this.index,
          chartIndex: this.currentIndex
        } )
      }

      this.currentIndex = 0
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.pad-bottom {
  padding-bottom: 1em;
}
.indexButton {
  position: static;
  margin: 0.2em;
  width: 50px;
  height: 40px;
  display: inline-block;
  flex-shrink: 0;
}
.controlSection {
  margin-left: 1em;
  margin-right: 1em;
}
.deletebutton {
  padding-bottom: 1em;
}
</style>
