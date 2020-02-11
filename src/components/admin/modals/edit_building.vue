/*
 * @Author: you@you.you
 * @Date:   Sunday February 2nd 2020
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Sunday February 2nd 2020
 * @Copyright:  (c) Oregon State University 2020
 */
<template>
  <el-dialog size='lg' :visible.sync="visible" :title='(!buildingId) ? "New Building" : `Edit ${buildingName}`' width="80%" @open='updateForm()'>
    <el-form :model='form' ref='form'>
      <!-- <el-form-item label='Name: ' prop='name' :rules="{required: true, message: 'A name is required', trigger: 'blur'}">
        <el-input type='text' v-model='form.name' ></el-input>
      </el-form-item> -->
      <!-- <el-form-item label='Sub-Title: ' prop='description' :rules="{required: false, message: 'A name is required', trigger: 'blur'}">
        <el-input type='text' v-model='form.description' ></el-input>
      </el-form-item> -->
      <el-form-item prop='group' label='Group: ' :rules="{required: true, message: 'A group is required', trigger: 'blur'}">
        <el-select v-model="form.group" style='width: 100%;'>
          <el-option label='Academics' value='Academics'></el-option>
          <el-option label='Residence' value='Residence'></el-option>
          <el-option label='Events & Admin' value='Events & Admin'></el-option>
          <el-option label='Athletics & Rec' value='Athletics & Rec'></el-option>
          <el-option label='Dining' value='Dining'></el-option>
        </el-select>
      </el-form-item>
      <el-collapse v-model="activeName" accordion @change='checkMap'>
        <el-collapse-item name="map" title="Location">
          <el-form-item prop='mapId' label=''>
            <mappicker v-model='form.mapId' ref='mappicker'/>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item name="media" title="Image">
          <el-form-item prop='media' label=''>
            <mediapicker v-model='form.media' ref='mediapicker'/>
          </el-form-item>
        </el-collapse-item>
        <el-collapse-item name="meters" title="Meters">
          <el-form-item prop='meters' label=''>
            <meterpicker v-model='form.meters' ref='meterpicker'/>
          </el-form-item>
        </el-collapse-item>
      </el-collapse>
    </el-form>

    <span slot='footer'>
      <el-button @click='deleteBuilding()' type='danger'>Delete</el-button>
      <el-button @click='saveBuilding()' type='primary'>Save</el-button>
      <el-button type='info' @click='visible = false'>Cancel</el-button>
    </span>
  </el-dialog>
</template>

<script>
import mediapicker from '@/components/extras/media_picker.vue'
import mappicker from '@/components/admin/building_edit_map.vue'
import meterpicker from '@/components/admin/building_edit_meters.vue'

export default {
  components: {
    mediapicker,
    mappicker,
    meterpicker
  },
  data () {
    return {
      activeName: '',
      form: {
        media: '',
        group: '',
        mapId: null,
        meters: []
      }
    }
  },
  computed: {
    buildingId: {
      get () {
        return this.$store.getters['modalController/data'].id
      }
    },
    buildingName: {
      get () {
        let buildingPath = this.$store.getters['map/building'](this.buildingId).path
        return this.$store.getters[buildingPath + '/name']
      }
    },
    visible: {
      get () {
        return this.$store.getters['modalController/modalName'] === 'edit_building'
      },

      set (value) {
        if (value === false) {
          this.$store.dispatch('modalController/closeModal')
        }
      }
    }
  },
  methods: {
    async saveBuilding () {
      if (this.buildingId) {
        let buildingPath = this.$store.getters['map/building'](this.buildingId).path
        // let passedMeters = []
        // for (let meter of this.form.meters) {
        //   if (meter.id.includes('newgroup')) {
        //     this.$store.dispatch(buildingPath + '/newMeterGroup', {
        //       name: meter.name,
        //       meters: meter.meters
        //     })
        //   } else {
        //     passedMeters.push(meter)
        //   }
        // }
        this.$store.dispatch(buildingPath + '/update', {
          image: this.form.media,
          group: this.form.group,
          mapId: this.form.mapId,
          meters: this.form.meters
        })
      } else {
        this.$store.dispatch('map/newBuilding', {
          image: this.form.media,
          group: this.form.group,
          mapId: this.form.mapId,
          meters: this.form.meters
        })
      }
      this.visible = false
    },
    checkMap (value) {
      if (value === 'map') {
        this.$nextTick(() => {
          this.$refs.mappicker.map.invalidateSize()
        })
      }
    },
    updateForm () {
      if (this.buildingId) {
        let buildingPath = this.$store.getters['map/building'](this.buildingId).path
        this.form.media = this.$store.getters[buildingPath + '/image']
        this.form.group = this.$store.getters[buildingPath + '/group']
        this.form.mapId = this.$store.getters[buildingPath + '/mapId']
        let meters = this.$store.getters[buildingPath + '/meterGroups']
        this.form.meters = []
        for (let group of meters) {
          let formGroup = {
            id: group.id,
            name: this.$store.getters[group.path + '/name'],
            meters: []
          }
          for (let meter of this.$store.getters[group.path + '/meters']) {
            formGroup.meters.push({
              id: meter.id,
              operation: (meter.negate) ? 0 : 1
            })
          }
          this.form.meters.push(formGroup)
        }
      } else {
        this.form.media = ''
        this.form.group = ''
        this.form.mapId = null
        this.form.meters = []
      }
    }
  }
}
</script>

<style scoped lang='scss'>

</style>
