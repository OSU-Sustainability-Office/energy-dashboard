<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-24T13:56:21-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2018-12-27T12:18:59-08:00
-->
<template>
  <el-row>
  </el-row>
</template>

<script>
export default {
  mounted () {
    this.$store.dispatch('campaign', this.$route.params.id).then(() => {
    })
  }
}
</script>

<style scoped lang='scss'>
</style>
