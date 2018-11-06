<template>
  <el-row class="stage">
    <el-col class='main'>
      <heropicture :media='story.media' :description='story.description' :name='story.name'></heropicture>
      <navdir ref='navdir' @update='update' @save='save'></navdir>
      <featured ref='featureBox' />
    </el-col>
  </el-row>
</template>

<script>

import featured from '@/components/account/featured'
import heropicture from '@/components/account/heropicture'
import navdir from '@/components/account/navdir'
import { mapGetters } from 'vuex'

export default {
  name: 'account',
  components: {
    featured,
    heropicture,
    navdir
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
          d.setTime(d.getTime() - d.getTimezoneOffset() * 60 * 1000)
          switch (parseInt(this.$route.params.range)) {
            case 0:
              d.setDate(d.getDate() - 7)
              break
            case 1:
              d.setMonth(d.getMonth() - 1)
              break
            case 2:
              d.setFullYear(d.getFullYear() - 1)
              break
            default:
              break
          }
          return d.toISOString()
        }
      }
    },
    end: {
      get () {
        if (this.$route.path.search('public') > 0) {
          let d = new Date()
          d.setTime(d.getTime() - d.getTimezoneOffset() * 60 * 1000)
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
              return 'day'
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
              return 1
            case 1:
              return 1
            case 2:
              return 7
            default:
              return 15
          }
        }
      }
    }
  },
  created () {
    this.$eventHub.$on('reloadCharts', () => {
      this.$refs.featureBox.updateCards()
    })
  },
  mounted () {
    this.update()
  },
  methods: {
    save: function () {
      for (let block of this.story.blocks) {
        if (block.id === null) {
          this.$store.dispatch('createBlock', block).then(() => {
            for (let chart of block.charts) {
              this.$store.dispatch('createChart', { index: block.index, name: chart.name, block_id: block.id, group_id: chart.group_id, point: chart.point, meters: chart.meters })
            }
          })
        } else {
          this.$store.dispatch('updateBlock', block).then(() => {
            for (let chart of block.charts) {
              if (chart.id) {
                this.$store.dispatch('updateChart', chart)
              } else {
                this.$store.dispatch('createChart', { index: block.index, name: chart.name, block_id: block.id, group_id: chart.group_id, point: chart.point, meters: chart.meters })
              }
            }
          })
        }
      }
      if (this.story.removed.length > 0) {
        for (let obj of this.story.removed) {
          if (obj.type === 'block') {
            this.$store.dispatch('deleteBlock', { id: obj.id })
          } else if (obj.type === 'chart') {
            this.$store.dispatch('deleteChart', { id: obj.id })
          }
        }
        this.$store.commit('resetRemoved')
      }
    },
    cancel: function () {
      let id = this.story.id
      this.$store.commit('loadStory', { id: null })
      this.$store.dispatch('story', id).then(() => {
        this.$refs.featureBox.updateCards()
      })
    },
    update: function () {
      if (this.$route.path.search('public') > 0) {
        this.path = ['Public']
        this.$store.dispatch('story', this.$route.params.id).then((r) => {
          let promises = []
          for (let b in r.blocks) {
            let c = {
              index: b,
              date_start: this.start,
              date_end: this.end,
              date_interval: this.interval,
              interval_unit: this.unit
            }
            promises.push(this.$store.dispatch('block', c))
          }

          Promise.all(promises).then((t) => {
            this.$refs.featureBox.updateCards()
            this.$refs.navdir.populate()
          })
        })
      } else {
        if (this.$route.params.id) {
          this.$store.dispatch('story', this.$route.params.id).then((r) => {
            this.$refs.featureBox.updateCards()
            this.$refs.navdir.populate()
          })
        } else {
          this.$store.dispatch('user').then(user => {
            this.$store.dispatch('stories').then(groups => {
              if (!this.story.id) {
                this.$store.dispatch('story', groups[0].stories[0].id).then(() => {
                  this.$refs.navdir.populate()
                })
              } else {
                this.$refs.navdir.populate()
              }
            })
          })
        }
      }
    },
    changeStory: function (event) {
      this.editingStory = false
      this.$store.dispatch('story', event[0])
    }
  }
}
</script>

<style scoped lang='scss'>
@import '@/assets/style-variables.scss';

.stage {
  position: absolute;
  top: 0;
  left: 0;
  height: calc(100vh - #{$--nav-height});
  width: 100%;
  margin: 0;
  padding: 0;
}
.main {
  padding: 0;
}
</style>
