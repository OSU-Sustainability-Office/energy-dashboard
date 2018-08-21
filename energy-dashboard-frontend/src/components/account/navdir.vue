<template>
  <div class='bar container-fluid'>
    <div class='row main align-items-center'>
      <b-dropdown v-for='(item, index) in path' variant="link" :key='index' :id='"dropdown-" + index' class="itm col-2" boundary="window" no-caret>
        <template slot='button-content'>
          <div class='container-fluid'>
            <div class='leftP'>
              <i :class="getClass(item,index)"></i>
            </div>
            <div class='it'>{{ item }}</div>
            <div class='rightP'>
              <i class="fas fa-caret-down"></i>
            </div>
          </div>
        </template>
        <b-dropdown-item v-for='(otherStory, index_o) in getDataForPathIndex(index)' :key='index_o' class='' @click='moveRoute(index, index_o)'>
          <i :class='getClass(otherStory,index)'></i>
          {{ otherStory }}
        </b-dropdown-item>
      </b-dropdown>
    </div>
  </div>
</template>

<script>
export default {
  name: 'navdir',
  props: ['path', 'groupContents'],
  up: 0,
  data () {
    return {
      groupName: ''
    }
  },
  asyncComputed: {
    groups: {
      get: function () {
        return this.$store.dispatch('stories')
      }
    }
  },
  methods: {
    getClass: function (name, index) {
      if (index === 0) {
        if (name === 'Public') {
          return 'fas fa-globe'
        } else {
          return 'fas fa-user'
        }
      } else if (index === 1) {
        return 'fas fa-th-large'
      } else {
        return 'fas fa-building'
      }
    },
    getDataForPathIndex: function (i) {
      if (i === 0) {
        return ['Public', 'Your Dashboard']
      } else if (i === 1) {
        let r = []
        if (!this.groups) {
          return
        }
        for (let group of this.groups) { r.push(group.group) }
        return r
      } else if (i === 2) {
        let r = []
        if (!this.groups) {
          return
        }
        for (let story of this.groups.find(elm => elm.group === this.path[1]).stories) { r.push(story.name) }
        return r
      } else {
        return ['Error']
      }
    },
    moveRoute: function (dirI, dropI) {
      if (dirI === 0) {
        this.$router.push({ path: `/directory` })
      } if (dirI === 1) {
        this.$router.push({ path: `/directory/${this.groups[dropI].group}` })
      } else if (dirI === 2) {
        this.$parent.changeStory([this.groups.find(elm => elm.group === this.path[1]).stories[dropI].id, 0])
      }
    }
  }
}
</script>
<style scoped>
  .bar {
    position: absolute;
    left: 0px;
    height: 40px;
    z-index: 10;
    box-shadow: 0px 2px 4px -2px rgba(0,0,0,0.5);
  }
  .row.main {
    position: absolute;
    left: 1%;
    white-space: nowrap;
    height: 100%;
    width: 100%;
  }
  .itm {
    background-color: #FFF;
    display: inline-block;
    height: 100%;
    border-right: solid 2px rgb(226,226,226);
    /* clip-path:polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 15px 50%); */
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
    padding-top: 7px;
    color: #D73F09;
  }
  .rightP {
    display: inline-block;
    position: absolute;
    right: 0px;
    top: 0px;
    width: 10px;
    padding-top: 7px;
    color: #D73F09;
  }
  .it {
    text-overflow: ellipsis;
    display: inline-block;
    color: #000;
    padding-left: 30px;
    padding-top: 2px;
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
  .itm:hover .rightP {
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
