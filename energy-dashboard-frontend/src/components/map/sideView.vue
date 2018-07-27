<template>
  <div class="view container">
    <div class="title row">
      <!-- {{ title }} -->
      <span class="col">{{ title }}</span>
      <span class="col-1"><i class="fas fa-times" @click="hide()" v-tooltip="'Delete Story'"></i></span>
    </div>
    <div class="media row" ref='media'>
      <!-- <img v-if='media' :src='api+"block-media/thumbs/"+media' /> -->
    </div>
    <div class="graphcontrol container-fluid">
      <div class="buttons row">
        <btn class="col">Week</btn>
        <btn class="col active">Month</btn>
        <btn class="col">Year</btn>
      </div>
      <div class="d-flex flex-row graph" ref='scrollBox'>
        <div class="col inline" v-for='block in blocks'>
          <chartController v-bind:start='dateOffset()' :end='(new Date()).toISOString()' v-bind:interval='int' v-bind:unit='unit' graphType=1 v-bind:points='[block.point]' v-bind:groups='[block.group_id]' :names='[block.name]' :submeters='[block.meter]' ref="chartController"  class="chart" :styleC="{ 'display': 'inline-block', 'width': '100%','height': '100%', 'padding': '0.5em' }"/>
        </div>
      </div>
      <i class="graphslide left fas fa-caret-left" @mouseover='displayArrow($event)' @mouseleave='hideArrow($event)' @click='prev()'></i>
      <i class="graphslide right fas fa-caret-right" @mouseover='displayArrow($event)' @mouseleave='hideArrow($event)' @click='next()'></i>
      <div class="buttons row">
        <btn class="col">View in Dashboard</btn>
      </div>
      <div class="utilities container-fluid">
        <div class="row head">
          <div class="col">
            Building Utilities
          </div>
        </div>
        <div class="row">
          <div class="col">
            Electric
          </div>
        </div>
        <div class="row">
          <div class="col">
            Steam
          </div>
        </div>
      </div>
    </div>
  </div>
</template>
<script>
  import chartController from '@/components/charts/chartController'
  export default {
    name: "sideView",
    props: [],
    components: {
      chartController
    },
    data() {
      return {
        api: process.env.ROOT_API,
        title: '',
        media: '',
        currentRange: 1,
        unit: 'day',
        int: 1,
        blocks: [],
        index: 0

      }
    },
    methods: {
      hide: function() {
        this.$el.style.display = "none";
      },
      dateOffset: function() {
        var d = new Date();
        if (this.currentRange === 0) {
          d.setDate(d.getDate() - 7);
        }
        else if (this.currentRange === 1) {
          d.setMonth(d.getMonth() - 1);
        }
        else if (this.currentRange === 2){
          d.setYear(d.getYear() - 1);
        }
        return d.toISOString();
      },
      displayArrow: function(target) {
        if (target.target.classList.contains('right') && this.index < this.blocks.length) {
          target.target.style.opacity = 1;
          this.index++;
        }
        if (target.target.classList.contains('left') && this.$refs.scrollBox.scrollLeft > 0) {
          target.target.style.opacity = 1;
          this.index--;
        }

      },
      hideArrow: function(target) {
        target.target.style.opacity = 0;
      },
      next: function() {
        this.$refs.scrollBox.scrollLeft += this.$refs.scrollBox.clientWidth+20;
      },
      prev: function() {
        this.$refs.scrollBox.scrollLeft -= this.$refs.scrollBox.clientWidth+20;
      },
    },
    watch: {
      media: function(value) {
        this.$refs.media.style.backgroundImage = 'url('+this.api+'block-media/thumbs/'+value+')';
      },
      blocks: function(value) {
        this.$nextTick(() => {
          for (var i in value) {
            //console.log(value[i]);
            this.$refs.chartController[i].getData(0,value[i].point,value[i].group_id,this.dateOffset(),(new Date()).toISOString(),this.int,this.unit,value[i].meter);
          }
        });

      }
    },
    mounted() {
      this.$nextTick(() => {

      });
    }
  }
</script>
<style scoped>
  .view {
    position: absolute;
    left: 100%;
    top: 5%;
    width: 350px;
    height: 90%;
    background-color: rgb(26,26,26);
    z-index: 3000;
    margin-left: -360px;
    box-shadow: -1px 1px 6px rgba(0,0,0,0.6);
    display: none;
  }
  .media {
    height: 200px;
    background-repeat: no-repeat;
    background-size: cover;
    background-position: center;
  }
  .chart {
    height: 200px;
    width: 100%;
    background-color: #000;
    margin-top: 0.5em;
    border-radius: 10px;
  }
  .row {
    margin-top: 0;
    margin-bottom: 0;
  }
  .graphcontrol {
    margin-top: 1em;
    position: relative;
  }
  .buttons > * {
    margin: 0.5em;
  }
  .btn {
    background-color: #000;
    color: #FFF;
  }
  .utilities .row {
    color: #FFF;
  }
  .utilities .row.head {
    margin-top: 1em;
    color: #FFF;
  }
  .row.head {
    font-size: 1.2em;
    border-bottom: 1px solid rgba(0,0,0,0.6);
  }
  .btn.active {
    background-color: rgb(215,63,9);
  }
  .title {
    font-size: 1.7vw;
    height: 1.8em;
    background-color: rgb(215,63,9);
    color: #FFF;
    padding: 0.25em;
    font-family: 'StratumNo2';
  }
  .title .col-1 {
    padding-right: 1em;
    padding-top: 0.05em;
  }
  .graph {
    overflow-x: hidden;
    overflow-y: hidden;

  }
  .inline {
    flex: 0 0 100%;
    padding: 0;
    margin-right: 20px;
  }
  .graphslide {
    position: absolute;
    color: white;
    background-color: rgb(215,63,9);
    font-size: 2.5em;
    width: 1em;
    height: 1em;
    text-align: center;
    margin-top: calc(50% - 0.5em);
    top: 0px;
    border-radius: 1em;
    opacity: 0;
    transition: 0.2s opacity;
  }
  .graphslide:hover {

  }

  .graphslide.right {
    right: -0.1em;
    padding-left:0.1em;
  }
  .graphslide.left {
    left: -0.1em;
    padding-right:0.1em;
  }

</style>
