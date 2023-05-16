<template>
    <el-row>
      <el-col :span='24' class='cont'>
        <span class='title'>Contact Us</span>
        <br>
        <div class="center">
          <div class = "contact-div">
              <p class="body">Please email us at <a href="mailto:sustainability@oregonstate.edu">sustainability@oregonstate.edu</a> for feedback or questions, or check our <a href="/#/getstarted">FAQ</a>.</p>
          </div>
        </div>
    </el-col>
    </el-row>
  </template>
<script>

export default {
  name: 'contact',
  props: [],
  data () {
  },
  watch: {
  },
  mounted () {
  },
  methods: {
  }
}
</script>
  <style lang='scss' scoped>
  .cont {
    text-align: center;
    padding-top: 10%;
  }
  .title {
    font-size: 80px;
    color: black;
    font-family: 'open sans';
  }
  .body {
    font-size: 28px;
    color: black;
  }
  .contact-div {
    max-width: 800px;
  }
  .center {
  margin: auto;
  width: 50%;
  padding: 10px;
}
  </style>
