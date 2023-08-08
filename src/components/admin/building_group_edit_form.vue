<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-11T10:22:10-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-12T14:47:06-08:00
-->

<template>
  <el-dialog title="Edit Building" :visible.sync="visible" width="80%" size="lg">
    <el-form ref="form" :model="form" label-width="120px">
      <el-form-item
        label="Building Name"
        :rules="{
          required: true,
          message: 'A building name is required',
          trigger: 'blur'
        }"
      >
        <el-input v-model="form.name"></el-input>
      </el-form-item>
    </el-form>
  </el-dialog>
</template>

<script>
export default {
  props: [],
  data () {
    return {
      visible: false,
      form: {
        name: '',
        media: '',
        meters: []
      }
    }
  },
  methods: {
    populate: function ( building ) {
      this.form.name = building.name
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss"></style>
