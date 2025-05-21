<!--
  Filename: Contact.vue
  Description: The contact page for the sustainability office.
-->
<template>
  <el-row>
    <el-col :span="24" class="cont">
      <span class="title">Contact Us</span>
      <br />
      <div class="center">
        <div class="contact-div">
          <p class="body">
            <el-row :gutter="20">
              <el-col :xs="16" :sm="16" :md="16" :lg="16" :xl="16">
                <a href="https://sustainability.oregonstate.edu/contact">Contact us here</a>
                with your comments and questions. Be sure to select "Sustainability Office" from the Category drop-down
                menu. You can also check out our
                <a href="/#/getstarted">FAQ</a>
                <el-image class="demo-visual" :src="contactDemo"></el-image>
              </el-col>
            </el-row>
          </p>
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
    return {
      contactDemo: 'https://energy-dashboard.s3-us-west-2.amazonaws.com/images/contactImage.png'
    }
  },
  watch: {},
  mounted () {},
  methods: {}
}
</script>
<style lang="scss" scoped>
a {
  color: #007bff;
  text-decoration: none;
}
.cont {
  text-align: center;
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

.center {
  margin: auto;
  width: 75%;
  padding: 20px;
}
.demo-visual {
  height: 100%;
  width: auto;
  box-shadow: rgba(0, 0, 0, 0.19) 0px 6px 8px;
}

.el-row {
  display: flex;
  align-items: center;
  justify-content: center;
  text-align: left;
}

@media only screen and (max-width: 600px) {
  .center {
    width: 80%;
  }
}
</style>
