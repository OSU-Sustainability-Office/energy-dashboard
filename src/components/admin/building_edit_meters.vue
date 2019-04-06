<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-11T10:22:10-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-04-01T15:24:18-07:00
-->

<template>
  <el-tabs type="card">
    <el-tab-pane label="Connected Meters">
      <el-table :data='value' stripe>
        <el-table-column prop='name' label='Name'>
        </el-table-column>
        <el-table-column prop='operation' label='Behavior'>
        </el-table-column>
        <el-table-column prop='address' label='Device'>
          <template slot-scope="scope">
            <span>{{ scope.row.address.substr(0, 12) }}</span>
          </template>
        </el-table-column>
        <el-table-column prop='address' label='Port'>
          <template slot-scope="scope">
            <span>{{ scope.row.address.replace(scope.row.address.substr(0, 12) + '_', '') }}</span>
          </template>
        </el-table-column>
      </el-table>
    </el-tab-pane>
    <el-tab-pane label="All Meters">
      <el-collapse v-model="activeNames">
        <el-collapse-item v-for='(dac, index) in allDevices' :title='dac.name' :name="index" :key='index'>
          <el-row>
            <el-col :span='2'>
              Port
            </el-col>
            <el-col :span='6'>
              Device Name
            </el-col>
            <el-col :span='16'>
              Behavior
            </el-col>
          </el-row>
          <el-row v-for='(meter, i2) in dac.meters' :key='i2'>
            <el-col :span='2'>
              {{ meter.port }}
            </el-col>
            <el-col :span='6'>
              {{ meter.name }}
            </el-col>
          </el-row>
        </el-collapse-item>
      </el-collapse>
    </el-tab-pane>
  </el-tabs>
</template>

<script>
export default {
  props: ['value'],
  data () {
    return {
      activeNames: []
    }
  },
  methods: {
  },
  asyncComputed: {
    allDevices: {
      get: function () {
        return this.$store.dispatch('allDevices')
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>

</style>
