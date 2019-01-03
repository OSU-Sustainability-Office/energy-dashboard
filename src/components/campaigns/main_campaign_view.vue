<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-24T13:56:21-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2018-12-28T13:52:03-08:00
-->
<template>
  <el-row>
    <el-row>
      <el-col :span='24'>
        <heropicture :media='story.media' :description='story.description' :name='story.name' />
      </el-col>
    </el-row>
    <el-row>
      <el-col :span='8'>
        <el-row v-for='building in story.blocks' :key='building.id'>
          <el-col :span='24'>
            {{ building.name }}
          </el-col>
        </el-row>
      </el-coL>
      <el-col :span='16'>
      </el-col>
    </el-row>
  </el-row>
</template>

<script>
import heropicture from '@/components/account/heropicture.vue'
import { mapGetters } from 'vuex'

export default {
  components: {
    heropicture
  },
  data () {
    return {
      buildings: []
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block',
      'user'
    ])
  },
  mounted () {
    this.$store.dispatch('campaign', this.$route.params.id).then(() => {

    })
  }
}
</script>

<style scoped lang='scss'>
</style>
