<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-11T10:22:10-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-03-25T14:26:06-07:00
-->

<template>
  <el-dialog title="Edit Building" :visible.sync="visible" width="80%" size='lg'>
    <el-form ref="form" :model="form" label-width="200px">
      <el-form-item label="Building Name" :rules="{required: true, message: 'A building name is required', trigger: 'blur'}">
        <el-input v-model="form.name"></el-input>
      </el-form-item>
      <el-form-item label="Building Location" >
        <editMap v-model='form.buildingId' />
      </el-form-item>
      <el-form-item label="Building Meters" >
        <editMeters v-model='form.meters' />
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
import editMap from '@/components/admin/building_edit_map'
import editMeters from '@/components/admin/building_edit_meters'
export default {
  components: {
    editMap,
    editMeters
  },
  props: [],
  data () {
    return {
      visible: false,
      form: {
        name: '',
        media: '',
        meters: [],
        buildingId: '0'
      }
    }
  },
  methods: {
    display: function (building) {
      this.form.name = building.name
      this.$store.dispatch('buildingIDForStory', building.id).then(r => {
        this.form.buildingId = r
      })
      this.visible = true
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>

</style>
