/*
 * @Author: you@you.you
 * @Date:   Friday December 13th 2019
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Friday December 13th 2019
 * @Copyright:  (c) Oregon State University 2019
 */
<template>
  <el-dialog size='lg' :visible.sync="visible" title="Delete View" width="80%">
    <span class='textMain'>
      Are you sure you want to delete this view?
    </span>
    <span slot='footer'>
      <el-button @click='viewDelete()' type='danger'> Delete </el-button>
      <el-button @click='visible = false' type='info'> Cancel </el-button>
    </span>
  </el-dialog>
</template>

<script>
export default {
  computed: {
    viewId: {
      get () {
        console.log(this.$store.getters['modalController/data'])
        return this.$store.getters['modalController/data'].id
      }
    },
    visible: {
      get () {
        return this.$store.getters['modalController/modalName'] === 'confirm_delete'
      },

      set (value) {
        if (value === false) {
          this.$store.dispatch('modalController/closeModal')
        }
      }
    }
  },
  methods: {
    viewDelete: function () {
      this.$store.dispatch('user/deleteView', this.viewId).then(() => {
        console.log(this.$store.getters['user/views'])
      })
      this.visible = false
    }
  }
}
</script>

<style lang='scss' scoped>
</style>
