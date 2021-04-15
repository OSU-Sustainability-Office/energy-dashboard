<template>
  <el-button plain>
    Won't close automatically
    </el-button>
</template>

<script>
export default {
  mounted () {
    this.$notify({
      title: 'First time using the Energy Dashboard?',
      message: 'Take a look at the "Get Started" tab to learn more and for FAQ\'s!',
      duration: 0
    })
  }
}
</script>
