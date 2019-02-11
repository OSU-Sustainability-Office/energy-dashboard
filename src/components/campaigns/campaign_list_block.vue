<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-04T11:40:29-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-11T09:03:16-08:00
-->
<template>
  <div class='block' ref='block' @click='$emit("click")'>
    <el-row>
      <el-col :span='24'>
        <span class='campaignName'>{{ name }}</span>
      </el-col>
    </el-row>
    <el-row class='popped'>
      <el-col :span='18' class='standings'>
        <!-- 1. Finley -20.00%  2. Bloss -15.00%  3. Kelley Engineering Center +115.00% -->
      </el-col>
      <el-col :span='6' class='dates'>
        {{ start | trunc }} - {{ end | trunc }}
      </el-col>
    </el-row>
  </div>
</template>
<script>

export default {
  props: ['name', 'media', 'start', 'end'],
  data () {
    return {
    }
  },
  mounted () {
    this.$refs.block.style.background = 'linear-gradient(to bottom right, rgba(0, 0, 0, 0.9),  rgba(0, 0, 0, 0.2)),url("' + process.env.VUE_APP_ROOT_API + '/energy/images/' + this.media + '") center/cover no-repeat'
  },
  filters: {
    trunc: function (val) {
      const d = new Date(val)
      return (d.getMonth() + 1) + '/' + (d.getDate()) + '/' + d.getFullYear()
    }
  }
}

</script>
<style scoped lang='scss'>
.block {
  margin: 1em;
  position: relative;
  height: 220px;
  background-color: $--color-black;
  border-radius: 5px;
  overflow: hidden;
  text-align: left;
}
.block:hover {
  cursor: pointer;
}
.block:hover .popped {
    background-color: $--color-primary;
}
.block:hover .dates {
  color: $--color-white !important;
}

.block .el-row:not(.popped) {
  padding: 1em;
}
.campaignName {
  font-size: 34px;
  color: $--color-white;
  font-family: "StratumNO2";
}
.popped {
  background-color: $--color-black;
  position: absolute;
  height: 50px;
  bottom: 0px;
  width: 100%;
  border-top: 1px solid $--color-white;
  // box-shadow: inset 0 6px 5px -6px #000000;
}
.popped .el-col {
  padding: 1em;
  color: $--color-primary;
}
.dates {
  font-family: "StratumNO2";
  text-align: right;
  font-size: 22px;
  line-height: 5px;
  color: $--color-primary !important;
}
.standings {
  font-size: 16px;
  line-height: 15px;
}
</style>
