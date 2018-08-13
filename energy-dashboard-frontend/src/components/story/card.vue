<template>
  <div class="area">
      <div class="chartSection">
        <chartController :graphType="graph_type"/>
      </div>
      <div class="expand" ref="buttonsAndStuff">
        <i class="fas" v-on:click="isMaximized = !isMaximized" v-bind:class="{ 'fa-chevron-circle-left' : !isMaximized, 'fa-chevron-circle-right' : isMaximized }"></i>

        <div class="descriptionSection">
          <span class="nameHighlight">{{ name }}</span>
          <br />
          <br />
          {{ description }}
          <div class="buttonSection">
            <btn @click="$parent.prevBlock()" v-bind:class="{ 'btn-display' : this.$parent.isPreviousBlock(), 'btn-nodisplay' : !this.$parent.isPreviousBlock() }" >Previous</btn>
            <btn  @click="$parent.nextBlock()" v-bind:class="{ 'btn-display' : this.$parent.isNextBlock(), 'btn-nodisplay' : !this.$parent.isNextBlock() }">Next</btn>
          </div>
        </div>
      </div>
  </div>
</template>
<script>
import chartController from '@/components/charts/chartController'

export default {
  props: ['name', 'media', 'description', 'date_end', 'date_start', 'descr', 'graph_type', 'id', 'story_id'],
  components: {
    chartController
  },
  data () {
    return {
      isMaximized: false
    }
  },
  methods: {

  },
  watch: {
    isMaximized: function (value) {
      // open section
      if (value) {
        this.$refs.buttonsAndStuff.style.right = '1em'
      } else {
        this.$refs.buttonsAndStuff.style.right = 'calc(-20% + 3.8em)'
      }
    }
  }
}
</script>
<style scoped>

.btn-display {
  display: inline-block;
}
.btn-nodisplay {
  display: none;
}
.nameHighlight {
  color: rgb(215,63,9);
  padding: 0.4em;
  font-size: 1.2em;
  text-align: center;
  width: 100%;
}

.btn {
  color: white;
  background-color: transparent;
}

.btn:hover {
  color: black;
  background-color: white;
}

.area {
  background-color: black;
  position: relative;
}

.expand {
  position: absolute;
  top: 0px;
  right: calc(-20% + 3.8em);
  height: 100%;
  display: inline-block;
  width: 20%;
  background-color: rgba(0,0,0,0.8);
  transition: right 1s;
  -webkit-transition: right 1s;
}
 .expand i {
   font-size: 2em;
   margin-left: 0.4em;
   position: absolute;
   padding-top: 70%;
   color: white;
   z-index: 2;
 }

.chartSection {
  position: relative;
  display: inline-block;
  width: 100%;
  padding-right: 5em;
  padding-top: 5em;
  padding-bottom: 5em;
  padding-left: 2em;
}
.descriptionSection {
  position: absolute;
  top: 0px;
  height: 100%;
  width: 100%;
  color: white;
  padding: 4em;
  padding-right: 1em;
}

.buttonSection {
  width: 100%;
  position: absolute;
  bottom: 0px;
  padding-bottom: 2em;
}

</style>
