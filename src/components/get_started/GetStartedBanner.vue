<!--
  Filename: GetStartedBanner.vue
  Description: Banner component for the "Get Started" page.
-->
<template>
  <div>
    <div id="center">
      <h2 class="highlight">COMMITTED TO:</h2>
      <BannerCommitments />
    </div>
  </div>
</template>
<script>
import BannerCommitments from '@/components/get_started/BannerCommitments.vue'

export default {
  name: 'GetStartedBanner',
  components: {
    BannerCommitments
  },
  data () {
    return {
      activeNames: ['1']
    }
  },
  methods: {
    handleChange (val) {
      console.log(val)
    }
  }
}
</script>

<style>
.highlight {
  color: #ffffff;
  font-size: 0.4em;
}
#center {
  color: #ffffff;
  font-family: 'StratumNo2';
  font-size: 5.5em;
  justify-content: center;
  height: 3em;
  width: 100%;
  padding-top: 1em;
  padding-left: 10px;
  background: url('/images/solar.jpg');
  background-size: cover;
  background-repeat: no-repeat;
}
</style>
