<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-11T10:22:10-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-11T12:06:28-08:00
-->

<template>
  <el-tabs v-model="tab" class="tab-control">
    <el-tab-pane label="Buildings" name="buildings" class="tab-pane">
      <buildings />
    </el-tab-pane>
    <el-tab-pane label="Campaigns" name="campaigns" class="tab-pane">
      <campaigns />
    </el-tab-pane>
    <el-tab-pane label="Users" name="users" class="tab-pane">
      <users />
    </el-tab-pane>
  </el-tabs>
</template>

<script>
import users from '@/components/admin/users'
import buildings from '@/components/admin/buildings'
import campaigns from '@/components/admin/campaigns'

export default {
  name: 'admin',
  components: {
    users,
    buildings,
    campaigns
  },
  props: [],
  data () {
    return {
      tab: 'buildings'
    }
  },
  created () {
    this.$store.dispatch( 'admin/users' )
  },
  methods: {
    newUser: function () {
      this.users.push( { id: null, name: '', privilege: 0 } )
    },
    saveUser: function () {},
    deleteUser: function () {},
    saveMeterGroup: function ( group ) {
      this.meterGroups[group]['user_id'] = 1
      if ( this.meterGroups[group].is_building ) {
        this.meterGroups[group].is_building = 1
      } else {
        this.meterGroups[group].is_building = 0
      }
    },
    newMeterGroup: function () {
      this.meterGroups.push( { meters: [] } )
    },
    deleteMeterGroup: function ( group ) {
      this.meterGroups.splice( group, 1 )
      // todo send delete to api
    },
    deleteMeter: function ( group, meter ) {
      group.meters.splice( meter, 1 )
    },
    addMeter: function ( group ) {
      group.meters.push( {} )
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.tab-control {
  padding: 1em;
}
.tab-pane {
  padding: 1em;
}
</style>
