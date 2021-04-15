<template>
  <div >
    <div id="center">
    <h2 class="highlight">COMMITTED TO:</h2>
    <commitment />
    </div>
  </div>
</template>
<script>
import commitment from '@/components/get_started/commitment'

export default {
  name: 'getStartedBanner',
  components: {
    commitment
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
  color: #000;
  font-size: 0.4em;
}
#center {
  color: #000;
  font-family: 'StratumNo2';
  font-size: 5.5em;
  align-content: center;
  height: 2.5em;
  width: 100%;
  padding-top: 0.5em;

}
/*
* Don't think I need this

@media screen and (max-width: 900px) {
  #center {
     font-size: 60px;
  }
  .highlight {
    font-size: 20px;
  }
}
@media screen and (max-width: 575px) {
  #center {
     font-size: 30px;
  }
  .highlight {
    font-size: 18px;
  }
}
*/
</style>
