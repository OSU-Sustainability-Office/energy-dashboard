<template>
  <div class="background">
    <!-- <span class="main-heading">Stories</span> -->
    <heropicture :media='story.media' :description='story.description' :name='story.name'></heropicture>
    <navdir :key='pathFlag' ref='navdir' class="naviv"></navdir>
    <featured :cards="story.blocks" :fromMap='true' ref='featureBox' />
  </div>
</template>

<script>

import carousel from '@/components/account/carousel'
import featured from '@/components/account/featured'
import storyEdit from '@/components/account/storyEdit'
import heropicture from '@/components/account/heropicture'
import navdir from '@/components/account/navdir'
import { mapGetters } from 'vuex'

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
  asyncComputed: {
    stories: {
      get: function () {
        return this.$store.dispatch('stories')
      }
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'block'
    ]),
    start: {
      get () {
        if (this.$route.path.search('public') > 0) {
          let d = new Date()
          switch (parseInt(this.$route.params.range)) {
            case 0:
              d.setDate(d.getDate() - 7)
              break
            case 1:
              d.setMonth(d.getMonth() - 1)
              break
            case 2:
              d.setYear(d.getYear() - 1)
              break
            default:
              break
          }
          return d.toISOString()
        }
      }
    },
    unit: {
      get () {
        if (this.$route.path.search('public') > 0) {
          switch (parseInt(this.$route.params.range)) {
            case 0:
              return 'hour'
            case 1:
              return 'hour'
            case 2:
              return 'day'
            default:
              return 'minute'
          }
        }
      }
    },
    interval: {
      get () {
        if (this.$route.path.search('public') > 0) {
          switch (parseInt(this.$route.params.range)) {
            case 0:
              return 2
            case 1:
              return 8
            case 2:
              return 5
            default:
              return 'minute'
          }
        }
      }
    }
  },
  mounted () {
    this.update()
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
    update: function () {
      if (this.$route.path.search('public') > 0) {
        this.path = ['Public']

        this.$store.dispatch('story', this.$route.params.id).then((r) => {
          let promises = []
          for (let b in r.blocks) {
            let c = {
              index: b,
              date_start: this.start,
              date_end: (new Date()).toISOString(),
              date_interval: this.interval,
              interval_unit: this.unit
            }
            promises.push(this.$store.dispatch('block', c))
          }

          Promise.all(promises).then((t) => {
            this.$refs.featureBox.updateCards()
          })
        })
      } else {
        this.$store.dispatch('user').then(user => {
          this.$store.dispatch('stories').then(groups => {
            if (!this.story.id) {
              this.$store.dispatch('story', groups[0].stories[0].id)
            }
          })
        })
      }
    },
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
      this.$store.dispatch('story', event[0])
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
