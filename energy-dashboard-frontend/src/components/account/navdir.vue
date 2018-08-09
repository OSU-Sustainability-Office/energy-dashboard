<template>
  <div class='bar container-fluid'>
    <div class='row main align-items-center'>
      <dropdown menu-right append-to-body class='col-2 itm' v-for='(item, index) in path'>
        <div class='dropdown-toggle'>
            <div class='leftP'>
              <i :class="getClass(item,index)"></i>
            </div>
            <div class='it'>{{ item }}</div>
        </div>
        <template slot="dropdown">
          <div class='selector'>
            <div v-for='(otherStory, index_o) in getDataForPathIndex(index)' @click='moveRoute(index, index_o)' class='title'>
              <i :class="getClass(otherStory,index)"></i>
              {{ otherStory }}
            </div>
          </div>
        </template>
      </dropdown>
      <div class='col itm-end'>
      </div>
    </div>
  </div>
</template>

<script>
  import axios from 'axios';
  export default {
    name: 'navdir',
    props: ['path','groupContents','groups'],
    up: 0,
    data() {
      return {
        groupName : '',
      }
    },
    methods: {
      getClass: function(name, index) {
        if (index === 0) {
          if (name === "Public") {
            return "fas fa-globe";
          }
          else {
            return "fas fa-user";
          }
        }
        else if (index === 1) {
          return "fas fa-th-large";
        }
        else {
          return "fas fa-building";
        }
      },
      getDataForPathIndex: function(i) {
        if (i === 0) {
          return ['Public','Your Dashboard']
        }
        else if (i === 1) {
          var r = [];
          for (var group of this.groups)
            r.push(group.name);
          return r;
        }
        else if ( i === 2) {
          var r = [];
          for (var story of this.groupContents)
            r.push(story.name);
          return r;
        }
        else {
          return ['Error'];
        }

      },
      moveRoute: function(dirI, dropI) {
        if (dirI === 2) {
          console.log(this.groupContents[dropI].id);
          this.$parent.changeStory([this.groupContents[dropI].id,0]);
        }
      },
      updatePath: function() {
        axios(process.env.ROOT_API+'api/getStoryGroup?id='+this.$parent.currentStory,{method: "get", withCredentials:true}).then(res => {
          this.groupName = res.data[0].group_name;
          this.$parent.path[1] = this.groupName;
          this.$parent.path[2]= this.$parent.storyName;
          console.log(this.$parent.path);

          this.$parent.groupContents = [];
          for (var story of res.data) {
            this.$parent.groupContents.push({id: story.story_id, name: story.story_name});
          }
          console.log(this.groupContents);
          this.$parent.pathFlag++;
        }).catch(e => {
          console.log(e);
        });
      }
    },
    mounted() {

    },
    watch: {

    }
  }
</script>
<style scoped>
  .bar {
    position: absolute;
    top: 200px;
    left: 0px;
    height: 40px;
    z-index: 0;
    box-shadow: 0px 2px 4px -2px rgba(0,0,0,0.5);
  }
  .row.main {
    position: absolute;
    left: 1%;
    white-space: nowrap;
    height: 100%;
    width: 100%;
    background-color: rgba(0,0,0,0.3);
  }
  .itm {
    background-color: #FFF;
    display: inline-block;
    padding-top: 10px;
    padding-left: 60px;
    margin-left: -17px;
    margin-right: 4px;
    height: 100%;
    /* border-right: solid 1px rgb(0,0,0); */
    clip-path:polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 15px 50%);
    color: rgb(26,26,26);
    cursor: pointer;
  }
  .itm-end {
    background-color: #FFF;
    display: inline-block;
    margin-left: -17px;
    height: 100%;
    clip-path:polygon(0 0, 100% 0, 100% 100%, 0 100%, 15px 50%);
    color: rgb(26,26,26);
    cursor: pointer;
  }
  .itm:hover {
    background-color: #D73F09;
    color: #FFF;
  }
  .leftP {
    display: inline-block;
    position: absolute;
    left: 0px;
    top: 0px;
    padding-top: 10px;
    padding-left: 30px;
    color: #D73F09;
  }
  .it {
    font-weight: bold;
    text-overflow: ellipsis;
    display: inline-block;
    padding-left: 10px;
  }
  .col-3.itm > .row > .col.it {
    padding-top: 10px;
  }
  .fas {
    font-size: 1.5em;
  }
  .itm:hover .leftP {
    color: #FFF;
  }
  .dropdown-toggle {
    width: 100%;
    height: 100%;
  }
  .selector {
    width: 250px;
    margin: 10px;
  }

  .selector .title{
    text-overflow: ellipsis;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
  .selector .title:hover {
    color: #D73F09;
  }
  .title {
    height: 30px !important;
    font-size: 1.2em !important;
    font-family: 'Open Sans', sans-serif !important;
  }
</style>
