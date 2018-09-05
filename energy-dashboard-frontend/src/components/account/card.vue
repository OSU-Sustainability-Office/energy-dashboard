<template>
  <div class="card featured" v-bind:class="{ feature : featured}" ref='card'>

    <chartController :index='index' :graphType='block(index).graph_type' ref="chartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': '100%','height': '100%', 'padding-right': '2.5em','padding-left':'1.5em','padding-top':'8em' }"/>
    <featureController :index='index' v-if="featured" ref="featureController" />
    <div class='titleTextFeatured personalTitle' v-if="!story.public" @click='editcard = true' ref='title' v-b-tooltip.hover title='Click to edit'>
      {{block(index).name}}
    </div>
    <div class='titleTextFeatured' v-if="story.public">
      {{block(index).name}}
    </div>
    <b-modal v-model='editcard' title='Edit Block' body-bg-variant="light" header-bg-variant="light" footer-bg-variant="light">
      <b-container>
        <div class="row">
          <label>Name:</label>
          <el-input type="text" v-model='tempName'></el-input>
        </div>
      </b-container>
      <b-container slot='modal-footer'>
        <div class='row'>
          <div class='col-6'>
            <b-btn @click='cardSave()' variant='primary'> Ok </b-btn>
            <b-btn @click='editcard = false'> Cancel </b-btn>
          </div>
          <div class='col text-right'>
            <b-btn @click='cardDelete()' variant='danger'> Delete </b-btn>
          </div>
        </div>
      </b-container>
    </b-modal>
  </div>
</template>

<script>

import chartController from '@/components/charts/chartController'
import featureController from '@/components/account/featureController'
import { mapGetters } from 'vuex'

export default {
  name: 'card',
  props: ['index', 'featured'],
  components: {
    chartController, featureController
  },
  data () {
    return {
      editcard: false,
      tempName: ''
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block'
    ])
  },
  methods: {
    cardSave: function () {
      this.editcard = false
      this.$store.commit('changeBlockName', { index: this.index, name: this.tempName })
      this.$store.commit('modifyFlag')
    },
    cardDelete: function () {
      this.editcard = false
      this.$store.commit('removeBlock', { index: this.index })
      this.$eventHub.$emit('reloadCharts')
      this.$store.commit('modifyFlag')
    }
  },
  watch: {
    editcard: function (v) {
      if (v) {
        this.tempName = this.block(this.index).name
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
  margin-left: 0.5%;
  margin-right: 0.5%;
  margin-top: 1em;
  border: 2px solid #000;
  border-radius: 5px;
  height: 10em;

  overflow: hidden;
  width: 250px;
}
.col {
  margin: 0em;
}
.feature {
  background: #000;
  height: 40em;
  padding-right: 2em;
  padding-left: 2em;
  width: 100%;
  flex: 1 1 49%;
}
.titleTextFeatured {
  color: rgb(215,63,9);
  font-size: 2em;
  font-family: 'StratumNo2';
  position: absolute;
  padding-top: 0.3em;
}
.personalTitle {
  cursor: pointer;
}
.descriptionTextFeatured {
  color: rgb(255,255,255);

}
.fas {
  color: #FFFFFF99;
  font-size: 2em;
  width: 100%;
  text-align: center;
  display: inline-block;
  cursor: pointer;
}
.storyName {
  color:rgb(215,63,9);
  font-family: 'StratumNo2';
  font-size: 1.8em;
  display: block;
}
.storyCard {
  padding: 1em;
  border: 2.5px solid rgb(215,63,9);
  height: 100%;
  width: 100%;
}
.storyDescription {
  color: #FFF;
  font-family: 'StratumNo2';
  font-size: 1.2em;
  display: block;
  padding-left: 0.3em;
}
</style>
