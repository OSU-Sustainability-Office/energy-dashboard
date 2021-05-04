<template>
  <div>
    <h2>
      The Energy Dashboard has been developed by the Oregon State University Sustainability Office to enable members of the OSU community to access, view, and analyze energy consumption trends.
    </h2>
    <div>
      <el-divider class="divider" content-position="left">
      Why We Created The Energy Dashboard
    </el-divider>
      <p>Something something</p>
      <el-image
        class="image"
        style="width: 400px; height: 250px"
        :src="pic1"
        >
      </el-image>
    </div>
    <div>
      <el-divider class="divider" content-position="left">
      How To Use The Energy Dashboard
    </el-divider>
      <p>Something something</p>
      <el-image
        class="image"
        style="width: 400px; height: 250px"
        :src="pic1"
        >
      </el-image>
    </div>
  </div>
</template>

<script>
export default {
  data () {
    return {
      pic1: '/images/solar.jpg',
      pic2: '',
      pic3: ''
    }
  }
}
</script>

<style>

.image {
  float: right;
  margin: 15px;
}
div {
  clear: right
}
</style>
