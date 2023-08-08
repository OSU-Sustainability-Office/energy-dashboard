/* * @Author: you@you.you * @Date: Friday December 13th 2019 * @Last Modified By: Brogan Miner * @Last Modified Time:
Friday December 13th 2019 * @Copyright: (c) Oregon State University 2019 */
<template>
  <el-dialog
    size="lg"
    :visible.sync="visible"
    :title="!viewId ? 'New View' : 'Edit View'"
    width="80%"
    @open="updateForm()"
  >
    <el-form :model="form" ref="form">
      <el-form-item
        label="Title: "
        prop="name"
        :rules="{
          required: true,
          message: 'A name is required',
          trigger: 'blur'
        }"
      >
        <el-input type="text" v-model="form.name"></el-input>
      </el-form-item>
      <!-- <el-form-item label='Sub-Title: ' prop='description' :rules="{required: false, message: 'A name is required', trigger: 'blur'}">
        <el-input type='text' v-model='form.description' ></el-input>
      </el-form-item> -->
    </el-form>
    <mediapicker v-model="form.media" ref="picker" />
    <span slot="footer">
      <el-button @click="deleteView()" type="danger" v-if="viewId">Delete</el-button>
      <el-button @click="saveView()" type="primary">{{ saveButtonText }}</el-button>
      <el-button type="info" @click="visible = false">Cancel</el-button>
    </span>
  </el-dialog>
</template>

<script>
import mediapicker from '@/components/extras/media_picker.vue'
export default {
  components: {
    mediapicker
  },
  data () {
    return {
      form: {
        name: '',
        description: '',
        media: ''
      }
    }
  },
  computed: {
    saveButtonText: {
      get () {
        if ( this.viewId ) {
          return 'Save'
        } else {
          return 'Create'
        }
      }
    },
    viewId: {
      get () {
        return this.$store.getters['modalController/data'].id
      }
    },
    visible: {
      get () {
        return this.$store.getters['modalController/modalName'] === 'edit_view'
      },

      set ( value ) {
        if ( value === false ) {
          this.$store.dispatch( 'modalController/closeModal' )
        }
      }
    },
    view: {
      get () {
        return this.$store.getters['user/view']( this.viewId )
      }
    }
  },
  methods: {
    updateForm: function () {
      if ( this.viewId ) {
        this.form.name = this.$store.getters[this.view.path + '/name']
        this.form.description = this.$store.getters[this.view.path + '/description']
        this.form.media = this.$store.getters[this.view.path + '/image']
      } else {
        this.form.name = ''
        this.form.media = ''
        this.form.description = ''
      }
    },
    deleteView: function () {
      if ( this.viewId ) {
        this.$store.dispatch( 'user/deleteView', this.viewId )
      }
      this.visible = false
    },
    saveView: async function () {
      if ( this.viewId ) {
        await this.$store.dispatch( this.view.path + '/save', this.form )
      } else {
        await this.$store.dispatch( 'user/newView', this.form )
      }
      this.visible = false
    }
  }
}
</script>

<style lang="scss" scoped></style>
