<template>
  <el-form :model="ruleForm" :rules="rules" ref="feedbackForm" label-width="120px" class="form">
    <el-form-item label="Full Name" prop="name">
      <el-input v-model="ruleForm.name"></el-input>
    </el-form-item>
     <el-form-item label="Email" prop="email">
      <el-input v-model="ruleForm.email"></el-input>
    </el-form-item>
    <el-form-item label="Feedback" prop="desc">
      <el-input type="textarea" v-model="ruleForm.desc"></el-input>
    </el-form-item>
    <el-form-item>
      <el-button type="primary" @click="submitForm('ruleForm')">Submit</el-button>
      <el-button @click="resetForm('ruleForm')">Reset</el-button>
    </el-form-item>
  </el-form>
</template>

<script>
export default {
  data () {
    return {
      ruleForm: {
        name: '',
        email: ''
      },
      rules: {
        name: [
          { required: true, message: 'Please input full name', trigger: 'blur' }
        ],
        email: [
          { required: true, message: 'Please input email', trigger: 'change' }
        ]
      }
    }
  },
  methods: {
    submitForm (formName) {
      this.$refs[formName].validate((valid) => {
        if (valid) {
          alert('submit!')
        } else {
          console.log('error submit!!')
          return false
        }
      })
    },
    resetForm (formName) {
      this.$refs[formName].resetFields()
    }
  }
}
</script>
