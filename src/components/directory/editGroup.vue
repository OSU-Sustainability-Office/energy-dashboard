<template>
  <el-dialog :visible.sync='toggle' :title='title' @open='form.name = name'>
    <el-form :model='form' ref='form'>
      <el-form-item label='Name: ' prop='name' :rules="{required: true, message: 'A name is required', trigger: 'blur'}">
        <el-input type='text' v-model='form.name' ></el-input>
      </el-form-item>
    </el-form>
    <span slot='footer'>
      <el-button @click='deleteGroup()' type='danger'>Delete</el-button>
      <el-button @click='saveGroup()' type='primary'>Save</el-button>
      <el-button @click='toggle = false'>Cancel</el-button>
    </span>
  </el-dialog>
</template>

<script>
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
  methods: {
    saveGroup: function () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('save', {name: this.form.name, id: this.id})
          this.toggle = false
        }
      })
    },
    deleteGroup: function () {
      this.$refs.form.validate((valid) => {
        if (valid) {
          this.$emit('delete', {id: this.id})
          this.toggle = false
        }
      })
    }
  }
}
</script>

<style scoped>
</style>
