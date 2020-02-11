<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-11T10:22:10-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-04-01T15:24:18-07:00
-->

<template>
  <el-row>
    <el-col :span='24'>
        <el-collapse v-model="activeName" accordion>
          <el-collapse-item v-for='meter of this.value' :name="meter.id" :key="meter.id">
            <template slot="title">
              <el-col :span='8'>
                <el-button @click.stop='' class='invisible-button'>
                  <el-input v-model='meter.name' placeholder='Name'>
                  </el-input>
                </el-button>
              </el-col>
              <el-col :span='12'>
                &nbsp;
              </el-col>
              <el-col :span='4'>
                <!-- <el-button type="primary" @click.stop=''>
                  <i class="el-icon-edit"></i>
                </el-button> -->
                <el-button type="danger" @click.stop='deleteGroup(meter.id)'>
                  <i class="el-icon-delete"></i>
                </el-button>
              </el-col>
            </template>
            <el-row>
              <el-col :span='24'>
                <el-input placeholder="Search" prefix-icon="el-icon-search" v-model='search'>
                </el-input>
              </el-col>
            </el-row>
            <el-row>
              <el-col :span='10'>
                Name
              </el-col>
              <el-col :span='6'>
                Address
              </el-col>
              <el-col :span='4'>
                Port
              </el-col>
              <el-col :span='2'>
                Included
              </el-col>
              <el-col :span='2'>
                Negate
              </el-col>
            </el-row>
            <el-row v-for='device of allDevices' :key='device.id'>
              <el-col :span='10'>
                {{ device.name }}
                <span v-if='!device.name'>
                  &nbsp;
                </span>
              </el-col>
              <el-col :span='6'>
                {{ device.address | address }}
                <span v-if='(!device.address || !device.address.split("_")[0])'>
                  &nbsp;
                </span>
              </el-col>
              <el-col :span='4'>
                {{ device.address | port }}
                <span v-if='(!device.address || !device.address.split("_")[1])'>
                  &nbsp;
                </span>
              </el-col>
              <el-col :span='2'>
                <el-checkbox v-model='checkedBoxes[device.id][meter.id].include' @change="updateModel"></el-checkbox>
              </el-col>
              <el-col :span='2'>
                <el-checkbox v-model="checkedBoxes[device.id][meter.id].negate" :disabled='!checkedBoxes[device.id][meter.id].include' @change="updateModel"></el-checkbox>
              </el-col>
            </el-row>
          </el-collapse-item>
        </el-collapse>
        <el-row>
          <el-col :span='24'>
            <el-button @click.stop='newGroup' type='default'>
              New Meter Group
            </el-button>
          </el-col>
        </el-row>
    </el-col>
  </el-row>
</template>

<script>
export default {
  props: ['value'],
  data () {
    return {
      activeName: '',
      search: '',
      allDevices: null,
      checkedBoxes: {},
      newCounter: 0
    }
  },
  watch: {
    value: {
      handler: function (value) {
        console.log(value)
        this.updateCheckBoxes()
      }
    }
  },
  methods: {
    updateModel (value, event) {
      let copiedValue = JSON.parse(JSON.stringify(this.value))
      for (let group of copiedValue) {
        group.meters = []
        for (let meter of Object.keys(this.checkedBoxes)) {
          if (this.checkedBoxes[meter][group.id].include) {
            group.meters.push({
              id: parseInt(meter),
              operation: (this.checkedBoxes[meter][group.id].negate) ? 0 : 1
            })
          }
        }
      }
      this.$emit('input', copiedValue)
    },
    newGroup () {
      let copiedValue = JSON.parse(JSON.stringify(this.value))
      let newMeter = {
        name: '',
        meters: [],
        id: 'newgroup_' + this.newCounter
      }
      this.newCounter++
      copiedValue.push(newMeter)
      this.$emit('input', copiedValue)
    },
    updateCheckBoxes () {
      this.checkedBoxes = {}
      for (let device of this.allDevices) {
        this.$set(this.checkedBoxes, device.id, {})
        for (let meter of this.value) {
          this.$set(this.checkedBoxes[device.id], meter.id, { include: false, negate: false })
          this.checkedBoxes[device.id][meter.id].include = (meter.meters.find(m => m.id === device.id) !== undefined)
          this.checkedBoxes[device.id][meter.id].negate = (meter.meters.find(m => m.id === device.id) !== undefined && meter.meters.find(m => m.id === device.id).operation === 0)
        }
      }
    },
    deleteGroup (id) {
      let copiedValue = JSON.parse(JSON.stringify(this.value))
      copiedValue.splice(copiedValue.map(m => m.id).indexOf(id), 1)
      this.$emit('input', copiedValue)
    }
  },
  filters: {
    address: value => {
      if (!value) return
      return value.split('_')[0]
    },
    port: value => {
      if (!value) return
      return value.split('_')[1]
    }
  },
  computed: {

  },
  mounted () {
    this.$store.dispatch('map/allDevices').then(devices => {
      this.allDevices = devices
      this.updateCheckBoxes()
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.invisible-button {
  padding: 0;
  border: 0;
  background-color: clear !important;
}
.invisible-button:hover {
  border: 0;
  background-color: clear !important;
}
</style>
