<template>
  <el-dialog :visible.sync='toggle' :title='title' width='90%'>
    <el-form :model='form' ref='form'>
      <el-form-item label='Title: ' prop='name' :rules="{required: true, message: 'A name is required', trigger: 'blur'}">
        <el-input type='text' v-model='form.name' ></el-input>
      </el-form-item>
      <el-form-item label='Sub-Title: ' prop='description' :rules="{required: false, message: 'A name is required', trigger: 'blur'}">
        <el-input type='text' v-model='form.decription' ></el-input>
      </el-form-item>
    </el-form>
    <mediapicker v-model='form.media' ref='picker'/>
    <span slot='footer'>
      <el-button @click='deleteStory()' type='danger' v-if='id !== null'>Delete</el-button>
      <el-button @click='saveStory()' type='primary'>Save</el-button>
      <el-button @click='toggle = false'>Cancel</el-button>
    </span>
  </el-dialog>
</template>

<script>
import mediapicker from '@/components/account/mediapicker.vue'

export default {
  components: {
    mediapicker
  },
  data () {
    return {
      toggle: false,
      id: null,
      title: '',
      form: {
        name: '',
        description: '',
        media: ''
      }
    }
  },
  methods: {
    saveStory: function () {
      this.$emit('save', { name: this.form.name, media: this.form.media, description: this.form.description, id: this.id })
      this.toggle = false
    },
    deleteStory: function () {
      this.$emit('delete', { id: this.id })
      this.toggle = false
    }
  }
}
</script>
<style scoped>
</style>
