<<<<<<< HEAD
<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-04T10:08:23-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-04T15:36:32-08:00
-->

=======
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
<template>
  <el-dialog :visible.sync='toggle' :title='title' @open='form.name = name'>
    <el-form :model='form' ref='form'>
      <el-form-item label='Name: ' prop='name' :rules="[{required: true, message: 'A name is required', trigger: 'blur'}, {validator: checkDuplicate, trigger: 'blur'}]">
        <el-input type='text' v-model='form.name' ></el-input>
      </el-form-item>
    </el-form>
    <span slot='footer'>
      <el-button @click='deleteGroup()' type='danger' v-if='title === "Edit Group"'>Delete</el-button>
      <el-button @click='saveGroup()' type='primary'>Save</el-button>
      <el-button type='info' @click='toggle = false'>Cancel</el-button>
    </span>
  </el-dialog>
</template>

<script>
import { mapGetters } from 'vuex'
export default {
  props: ['saveFunction'],
  data () {
    return {
      toggle: false,
      name: '',
      id: null,
      title: '',
      form: {
        name: ''
      }
    }
  },
  computed: {
    ...mapGetters([
      'stories'
    ])
  },
  methods: {
    saveGroup: function () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('save', {name: this.form.name, id: this.id})
          this.toggle = false
        }
      })
    },
    checkDuplicate: function (rule, value, callback) {
      let b = false
      for (const g of this.$parent.$parent.groups) {
<<<<<<< HEAD
        if (g.name === value && (g.id !== this.id || g.id === null)) {
=======
        if (g.name === value && g.id !== this.id) {
>>>>>>> 243757575dbfdcefe0d1addeb9f058f6eb2cafea
          b = true
          break
        }
      }
      if (b) {
        callback(new Error('Can not have two groups with the same name'))
      } else {
        callback()
      }
    },
    deleteGroup: function () {
      this.$emit('delete', {id: this.id})
      this.toggle = false
    }
  }
}
</script>

<style scoped>
</style>
