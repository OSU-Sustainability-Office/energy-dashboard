<template>
  <div class='container-fluid'>
    <navdir :path='path' :groups='subGroupsForPath()' class="bar"/>
    <div class='mainArea container-fluid'>
      <div class="container section" v-for='(item, index) in subGroupsForPath()' :key='index'>
        <div class="row">
          <div :class="[item.open ? 'open' : '']" class='col h3' :aria-controls='"collapse-"+item.name.replace(/ /g,"_").replace(/&/g,"a")' :aria-expanded='item.open' @click='pushItem(item,index)' >{{ item.name }}</div>
        </div>
          <b-collapse class="row justify-content-start padded" v-model='item.open' :id='"collapse-" + item.name.replace(/ /g,"_").replace(/&/g,"a")'>
            <div class='col-lg-3' v-for='(building, index_b) in item.subgroups' :key='index_b' @click='$router.push({path: `/public/${building.id}/1`})'>
              <storycard :name='building.name' :notools='true' :media='building.media' :description='building.description' class="storyCard" />
            </div>
          </b-collapse>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
import navdir from '@/components/account/navdir.vue'
import storycard from '@/components/account/storyCard.vue'

export default {
  name: '',
  components: {
    navdir,
    storycard
  },
  data () {
    return {
      groups: [],
      path: ['Public'],
      currentGroups: []
    }
  },
  created () {
    this.groups.push({name: 'Public', subgroups: []})
    this.groups.push({name: 'Your Dashboard', subgroups: []})
    axios.get(process.env.ROOT_API + 'api/getPublicGroups').then(res => {
      for (var group of res.data) {
        axios.get(process.env.ROOT_API + 'api/getGroupData?id=' + group.id).then(gd => {
          this.groups[0].subgroups.push({ name: gd.data[0][0].name, id: gd.data[0][0].id, subgroups: gd.data[1], open: this.path.includes(gd.data[0][0].name) })
        }).catch(e => {
          throw e
        })
      }
    }).catch(e => {
      console.log(e)
    })
    console.log(this.$route.params)
    if (this.$route.params.group) {
      this.path.push(this.$route.params.group)
    }
  },
  methods: {
    subGroupsForPath: function () {
      if (this.path[0] === 'Public') {
        return this.groups[0].subgroups
      }
      return this.groups[1].subgroups
    },
    pushItem: function (item) {
      for (let section of this.subGroupsForPath()) {
        if (section !== item) {
          section.open = false
        }
      }
      item.open = !item.open
      if (this.path.length > 1) {
        this.path.pop()
      }
      if (item.open) {
        this.path.push(item.name)
      }
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mainArea {
  position: absolute;
  left: 0px;
  width: 100%;
  border-radius: 10px;
  margin-top: 8em;
}
.h3 {
  border-bottom: solid 1px rgba(126,126,126,0.2);
  padding-bottom: 0.4em;
  font-family: "Open Sans", sans-serif;
  background-color: rgb(26,26,26);
  width: 100%;
  padding: 0.5em;
  color: #FFF;
  box-shadow: 0px 2px 4px -2px rgba(0,0,0,0.5);
  cursor: pointer;
}
.open {
  background-color: rgb(215,63,9) !important;
}
.h3:hover {
  background-color: rgb(215,63,9);
}
.h3:active {
  background-color: #d76740;
}
.padded {
  padding: 2em;
}
.section {
  border-radius: 10px;
  overflow: hidden;
  background-color: rgb(240,240,240);
  background: linear-gradient(180deg, rgb(240,240,240) 92%,rgb(190,190,190) 100%);
  color: #000;
  padding-bottom: 10px;
  margin-top: -10px;
  /* border: solid 1px rgb(126,126,126); */
}
.storyCard {
  cursor: pointer;
}
.storyCard:hover {
  border: solid 3px rgb(215,63,9);
}
.storyCard:active {
  border: solid 3px #FFF;
}
</style>
