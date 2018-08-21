<template>
  <div class="background">
    <!-- <span class="main-heading">Stories</span> -->
    <heropicture v-bind:id='currentStory'></heropicture>
    <navdir :key='pathFlag' :path="path" ref='navdir' class="naviv"></navdir>
    <!-- <span class="main-heading">Featured Blocks</span> -->
    <featured v-bind:cards="cardsFeatured" :fromMap='fromMap' ref='featureBox' v-if='!editingStory && currentStory !== null'/>
    <storyEdit v-if='editingStory' ref='storyEdit'/>
    <div class="nocards" v-if="currentStory === null">
      Please create  a story to get started
    </div>
  </div>
</template>

<script>

import carousel from '@/components/account/carousel'
import featured from '@/components/account/featured'
import storyEdit from '@/components/account/storyEdit'
import heropicture from '@/components/account/heropicture'
import navdir from '@/components/account/navdir'
import axios from 'axios'

export default {
  name: 'account',
  components: {
    carousel,
    featured,
    storyEdit,
    heropicture,
    navdir
  },
  props: [],
  data () {
    return {
      cards: [],
      cardsFeatured: [],
      currentStory: null,
      editingStory: false,
      fromMap: false,
      storyName: '',
      pathFlag: 0,
      path: [],
      groupContents: [],
      groups: []
    }
  },
  mounted () {
    if (this.$route.path.search('public') > 0) {
      this.fromMap = true
      this.path[0] = 'Public'
      this.changeStory([this.$route.params.id, 0])
      var startDate = new Date()
      switch (this.$route.params.range) {
        case 0:
          startDate.setDate(startDate.getDate() - 7)
          break
        case 1:
          startDate.setMonth(startDate.getMonth() - 1)
          break
        case 2:
          startDate.setYear(startDate.getYear() - 1)
          break
        default:
          break
      }
      for (var card of this.cardsFeatured) {
        card.start = startDate.toISOString()
        card.end = (new Date()).toISOString()
      }
    } else {
      this.fromMap = false
      this.path[0] = 'Your Dashboard'
    }
  },
  created () {
    axios(process.env.ROOT_API + 'api/getStoriesForCurrentUser', { method: 'get', withCredentials: true }).then(res => {
      if (!this.fromMap) {
        this.cards = res.data
        for (let card of this.cards) {
          if (card.featured) {
            this.currentStory = card.id
            this.storyName = card.name
            axios.get(process.env.ROOT_API + 'api/getBlocksForStory?id=' + card.id).then(res => {
              if (!this.fromMap) {
                for (let card of res.data) {
                  card.points = ['accumulated_real']
                  card.meters = [0]
                  card.names = ['Undefined']
                  card.groups = [8]
                  card.start = card.date_start
                  card.end = card.date_end
                  card.int = card.date_interval
                  card.unit = card.interval_unit
                  card.graphType = card.graph_type
                }
                this.cardsFeatured = res.data
              }
            }).catch(err => {
              throw err
            })
            return
          }
        }
      }
    }).catch(e => {
      this.errors.push(e)
    })
    this.$eventHub.$on('deleteStory', val => {
      var data = {
        id: val[0]
      }
      axios(process.env.ROOT_API + 'api/deleteStory', { method: 'post', data: data, withCredentials: true }).catch(err => {
        console.log(err)
      })
      for (var c in this.cards) {
        if (this.cards[c].id === val[0]) {
          this.cards.splice(c, 1)
          if (this.cards.length === 0) {
            this.currentStory = null
          }
          if (val[0] === this.currentStory) {
            this.$refs.caro.clickedStory(c - 1)
          }
          return
        }
      }
    })
  },
  watch: {
    cardsFeatured: function (val) {
      if (this.fromMap) {
        var startDate = new Date()
        switch (this.$route.params.range) {
          case '0':
            startDate.setDate(startDate.getDate() - 7)
            break
          case '1':
            startDate.setMonth(startDate.getMonth() - 1)
            break
          case '2':
            startDate.setYear(startDate.getYear() - 1)
            break
          default:
            console.log(this.$route.params.range)
            break
        }
        for (var card of val) {
          card.date_start = startDate.toISOString()
          card.date_end = (new Date()).toISOString()
        }
      }
    }
  },
  methods: {
    editStory: function (event) {
      this.editingStory = true
      this.$nextTick(function () {
        this.$refs.storyEdit.storyid = event[0]
        for (var i = 0; i < this.cards.length; i++) {
          if (this.cards[i].id === event[0]) {
            this.$refs.storyEdit.name = this.cards[i].name
            this.$refs.storyEdit.descr = this.cards[i].description
            this.$refs.storyEdit.media = this.cards[i].media
            break
          }
        }
      })
    },
    changeStory: function (event) {
      this.editingStory = false
      this.currentStory = event[0]
      if (event[1]) {
        axios(process.env.ROOT_API + 'api/changeFeaturedStory', { method: 'post', data: { id: event[0] }, withCredentials: true }).catch(e => {
          console.log(e)
        })
      }
      axios.get(process.env.ROOT_API + 'api/getStoryData?id=' + event[0]).then(res => {
        this.storyName = res.data[0].name
        this.$refs.navdir.updatePath()
      }).catch(e => {
        console.log(e)
      })
      axios.get(process.env.ROOT_API + 'api/getBlocksForStory?id=' + event[0]).then(res => {
        for (var card of res.data) {
          card.points = ['accumulated_real']
          card.meters = [0]
          card.names = ['Undefined']
          card.groups = [8]
        }
        this.cardsFeatured = res.data
        this.$nextTick(() => {
          this.$eventHub.$emit('reloadChart')
          this.pathFlag++
        })
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.naviv {
  position: absolute;
  top: 200px;
  left: 0px;
}
.background {
  background: #fff;
  top: 4em;
  bottom: 0px;
  position: absolute;
  width: 100%;
  padding: 1em;
}
.nocards {
  color: black;
  position: absolute;
  top: 400px;
  left: 0px;
  width: 100%;
  padding: 2em;
  text-align: center;
  font-size: 2em;
}
.main-heading {
  font-size: 3em;
  margin-left: .3em;
}
.scrollyBox {
  /* background-color: rgb(183,169,154); */
}
</style>
