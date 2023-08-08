<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-04T10:08:23-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-09T13:36:27-08:00
-->

<template>
  <el-row class="row-stage">
    <el-col :span="24">
      <el-row class="alertrow" v-for="(item, index) in alerts" :key="item.id" :span="24">
        <el-col :span="4" class="alertmeter">
          {{ item.building_name }}
          <br />
          <span class="metername">{{ item.meter_name }}</span>
        </el-col>
        <el-col :span="16">
          <el-form :inline="true" :model="alertForm[item.id]" class="form-inline" ref="alertForm">
            <el-form-item
              label="Measurement: "
              :rules="{
                required: true,
                message: 'A measurement is required',
                trigger: 'blur'
              }"
            >
              <el-select v-model="item.point" @change="updateAlert(item, index)">
                <el-option
                  v-for="(point, index) in points[item.meter_id]"
                  :value="point"
                  :label="$store.getters.mapPoint(point)"
                  :key="index"
                >
                </el-option>
              </el-select>
            </el-form-item>
            <el-form-item label="Threshold: ">
              <el-input-number v-model="item.threshold" @change="updateAlert(item, index)"></el-input-number>
            </el-form-item>
          </el-form>
        </el-col>
        <el-col :span="4" class="tools">
          <i class="fas fa-times" @click="deleteAlert(item.id)"></i>
        </el-col>
      </el-row>
      <el-row class="alertrow">
        <el-col class="center">
          <el-button @click="openCreationModal()"> Create New Alert </el-button>
          <el-dialog title="New Alert" :visible.sync="creationModal">
            <el-form :model="newAlertForm" ref="newAlertForm">
              <el-form-item
                label="Meter: "
                :rules="{
                  required: true,
                  message: 'A meter is required',
                  trigger: 'blur'
                }"
              >
                <el-select v-model="newAlertForm.meter" class="full-width" filterable :filter-method="meterSearch">
                  <el-option-group v-for="(group, index) in Object.keys(meterSearched)" :key="index" :label="group">
                    <el-option v-for="meter in meters[group]" :key="meter.id" :value="meter.id" :label="meter.name">
                    </el-option>
                  </el-option-group>
                </el-select>
              </el-form-item>
              <el-form-item
                label="Measurement: "
                :rules="{
                  required: true,
                  message: 'A measurement is required',
                  trigger: 'blur'
                }"
              >
                <el-select v-model="newAlertForm.point" :key="updatePoint">
                  <el-option
                    v-for="point in points[newAlertForm.meter]"
                    :value="point"
                    :label="$store.getters.mapPoint(point)"
                    :key="point"
                  >
                  </el-option>
                </el-select>
              </el-form-item>
              <el-form-item
                label="Threshold: "
                :rules="{
                  required: true,
                  message: 'A threshold is required',
                  trigger: 'blur'
                }"
              >
                <el-input-number v-model="newAlertForm.threshold"></el-input-number>
              </el-form-item>
            </el-form>

            <span slot="footer">
              <el-button @click="newAlert()" type="primary"> Ok </el-button>
              <el-button @click="creationModal = false" type="info"> Cancel </el-button>
            </span>
          </el-dialog>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>
<script>
export default {
  data () {
    return {
      newAlertForm: {
        meter: null,
        point: null,
        threshold: null
      },
      creationModal: false,
      updated: false,
      meterSearched: {},
      meters: {},
      points: {},
      alertForm: {},
      updatePoint: false,
      timeoutMap: {}
    }
  },
  mounted () {
    this.$store.dispatch( 'metersByBuilding' ).then( r => {
      this.meters = r
      this.meterSearched = r
    } )
    this.$store.dispatch( 'alerts' ).then( r => {
      for ( let alert of r ) {
        this.alertForm[alert.id] = {
          point: alert.point,
          threshold: alert.threshold
        }
        this.populatePoints( alert.meter_id )
      }
    } )
  },
  watch: {
    newAlertForm: {
      handler: function ( a ) {
        if ( a.meter ) {
          this.populatePoints( a.meter )
        }
      },
      deep: true
    }
  },
  asyncComputed: {
    alerts: {
      get () {
        return this.$store.dispatch( 'alerts' )
      },
      watch () {
        /* eslint-disable-next-line */
        this.updated
      }
    }
  },
  methods: {
    meterSearch: function ( input ) {
      const filtered = Object.keys( this.meters ).filter( name => name.toLowerCase().indexOf( input.toLowerCase() ) >= 0 )
      let r = {}
      for ( let name of filtered ) {
        r[name] = this.meters[name]
      }
      this.meterSearched = r
    },
    newAlert: function () {
      this.$refs.newAlertForm.validate( valid => {
        if ( valid ) {
          this.$store
            .dispatch( 'newAlert', {
              meter_id: this.newAlertForm.meter,
              point: this.newAlertForm.point,
              threshold: this.newAlertForm.threshold
            } )
            .then( () => {
              this.updated = !this.updated
              this.creationModal = false
            } )
        }
      } )
    },
    updateAlert: function ( item, index ) {
      if ( this.timeoutMap[item.id] ) {
        clearTimeout( this.timeoutMap[item.id] )
      }
      this.$refs.alertForm[index].validate( valid => {
        if ( valid ) {
          this.timeoutMap[item.id] = setTimeout( () => {
            const payload = {
              id: item.id,
              point: item.point,
              threshold: item.threshold
            }
            this.$store.dispatch( 'updateAlert', payload )
            this.timeoutMap[item.id] = null
          }, 500 )
        }
      } )
    },
    openCreationModal: function () {
      this.newAlertForm = {
        meter: null,
        point: null,
        threshold: null
      }
      this.creationModal = true
    },
    deleteAlert: function ( id ) {
      this.$store.dispatch( 'deleteAlert', { id: id } ).then( () => {
        this.updated = !this.updated
      } )
    },
    populatePoints: function ( id ) {
      this.$store.dispatch( 'meterPoints', { id: id } ).then( r => {
        this.points[id] = r
        this.updatePoint = !this.updatePoint
      } )
    }
  }
}
</script>

<style lang="scss" scoped>
.row-stage {
  height: 100%;
  width: 100% !important;
}
.heading {
  position: relative;
  height: 100px;
  border-bottom: solid 1px lighten($--color-black, 80%);
  padding-top: 18px;
  margin: 8px;
  padding-left: 15px;
  padding-right: 15px;
}
.alertrow {
  position: relative;
  height: 80px;
  border-bottom: solid 1px lighten($--color-black, 80%);
  padding-top: 18px;
  margin: 8px;
  padding-left: 15px;
  padding-right: 15px;
}
.alertmeter {
  font-size: 20px;
  text-align: left;
  color: $--color-black;
  display: inline-block;
  height: 80px;
}
.fas {
  color: $--color-primary;
  font-size: 25px;
  cursor: pointer;
}
.tools {
  text-align: right;
  padding-top: 5px;
  padding-right: 30px;
}
.metername {
  font-size: 15px;
  color: lighten($--color-black, 20%);
  padding-left: 5px;
  position: relative;
  top: -8px;
}
.full-width {
  width: calc(100% - 80px) !important;
}
.center {
  text-align: center;
}
</style>
