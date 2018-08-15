<template>
  <div class='container'>
    <navdir :path='path'/>
    <div class='mainArea container-fluid accordion' id="mainaccordion">
      <div v-if='path.length === 1' class="card section" v-for='(item, index) in subGroupsForPath()' :key='index'>
        <div class="row">
          <div class='col h3' data-toggle="collapse" :href='"#collapse-"+item.name.replace(/ /g,"_").replace(/&/g,"a")' aria-expanded="false">{{ item.name }}</div>
        </div>
          <div class="row collapse justify-content-start padded" :id='"collapse-" + item.name.replace(/ /g,"_").replace(/&/g,"a")' data-parent="#mainaccordion">
            <div class='col-lg-3' v-for='(building, index_b) in item.subgroups' :key='index_b' @click='$router.push({path: `/public/${building.id}/1`})'>
              <storycard :name='building.name' :notools='true' :media='building.media' :description='building.description' class="storyCard" />
            </div>
          </div>
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
      path: ['Public']
    }
  },
  created () {
    this.groups.push({name: 'Public', subgroups: []})
    this.groups.push({name: 'Your Dashboard', subgroups: []})
    axios.get(process.env.ROOT_API + 'api/getPublicGroups').then(res => {
      for (var group of res.data) {
        axios.get(process.env.ROOT_API + 'api/getGroupData?id=' + group.id).then(gd => {
          this.groups[0].subgroups.push({ name: gd.data[0][0].name, media: gd.data[0][0].media, description: gd.data[0][0].description, id: gd.data[0][0].id, subgroups: gd.data[1] })
        }).catch(e => {
          throw e
        })
      }
    }).catch(e => {
      console.log(e)
    })
  },
  methods: {
    subGroupsForPath: function () {
      for (let g of this.groups) {
        if (this.path.length > 1) {
          for (let b of g.subgroups) {
            if (b.name === this.path[this.path.length - 1]) {
              return b.subgroups
            }
          }
        } else {
          if (g.name === this.path[this.path.length - 1]) {
            return g.subgroups
          }
        }
      }
    }
  }
}
</script>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mainArea {
  position: absolute;
  top: 120px;
  left: 0px;
  width: 100%;
  border-radius: 10px;
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
