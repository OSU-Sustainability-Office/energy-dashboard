<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-17T14:07:35-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-29T12:26:21-08:00
-->

<template>
  <el-row class="stage">
    <el-col class="main">
      <heropicture :media="story.media" :description="story.description" :name="story.name"></heropicture>
      <navdir ref="navdir" @update="update" @save="save"></navdir>
      <featured ref="featureBox" :compareMode="$route.path.search('compare') > 0" />
    </el-col>
  </el-row>
</template>

<script>
import featured from '@/components/account/featured'
import heropicture from '@/components/extras/heropicture'
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
        return this.$store.dispatch( 'stories' )
      }
    }
  },
  computed: {
    ...mapGetters( ['story', 'block', 'user'] ),
    start: {
      get () {
        if ( this.$route.path.search( 'building' ) > 0 || this.$route.path.search( 'compare' ) > 0 ) {
          let d = new Date()
          switch ( parseInt( this.$route.params.range ) ) {
            case 0:
              d.setDate( d.getDate() - 7 )
              break
            case 1:
              d.setMonth( d.getMonth() - 1 )
              break
            case 2:
              d.setFullYear( d.getFullYear() - 1 )
              break
            default:
              break
          }
          return d.toISOString()
        } else {
          return ''
        }
      }
    },
    end: {
      get () {
        if ( this.$route.path.search( 'building' ) > 0 || this.$route.path.search( 'compare' ) > 0 ) {
          let d = new Date()
          return d.toISOString()
        } else {
          return ''
        }
      }
    },
    unit: {
      get () {
        if ( this.$route.path.search( 'building' ) > 0 || this.$route.path.search( 'compare' ) > 0 ) {
          switch ( parseInt( this.$route.params.range ) ) {
            case 0:
              return 'hour'
            case 1:
              return 'day'
            case 2:
              return 'day'
            default:
              return 'minute'
          }
        } else {
          return ''
        }
      }
    },
    interval: {
      get () {
        if ( this.$route.path.search( 'building' ) > 0 || this.$route.path.search( 'compare' ) > 0 ) {
          switch ( parseInt( this.$route.params.range ) ) {
            case 0:
              return 1
            case 1:
              return 1
            case 2:
              return 7
            default:
              return 15
          }
        } else {
          return ''
        }
      }
    }
  },
  created () {
    this.$eventHub.$on( 'reloadCharts', () => {
      this.$refs.featureBox.updateCards()
    } )
  },
  mounted () {
    this.update()
  },
  methods: {
    save: function () {
      let promises = []
      for ( let block of this.story.blocks ) {
        if ( block.id === null ) {
          this.$store.dispatch( 'createBlock', block ).then( () => {
            for ( let chart of block.charts ) {
              promises.push(
                this.$store.dispatch( 'createChart', {
                  index: block.index,
                  name: chart.name,
                  block_id: block.id,
                  group_id: chart.group_id,
                  point: chart.point,
                  meter: chart.meter
                } )
              )
            }
          } )
        } else {
          this.$store.dispatch( 'updateBlock', block ).then( () => {
            for ( let chart of block.charts ) {
              if ( chart.id ) {
                promises.push( this.$store.dispatch( 'updateChart', chart ) )
              } else {
                promises.push(
                  this.$store.dispatch( 'createChart', {
                    index: block.index,
                    name: chart.name,
                    block_id: block.id,
                    group_id: chart.group_id,
                    point: chart.point,
                    meter: chart.meter
                  } )
                )
              }
            }
          } )
        }
      }
      if ( this.story.removed.length > 0 ) {
        for ( let obj of this.story.removed ) {
          if ( obj.type === 'block' ) {
            promises.push( this.$store.dispatch( 'deleteBlock', { id: obj.id } ) )
          } else if ( obj.type === 'chart' ) {
            promises.push( this.$store.dispatch( 'deleteChart', { id: obj.id } ) )
          }
        }
        promises.push( this.$store.commit( 'resetRemoved' ) )
      }
      Promise.all( promises )
        .then( () => {
          this.$message( {
            message: 'Story saved successfully',
            type: 'success'
          } )
        } )
        .catch( () => {
          this.$message( {
            message: 'Error could not save story',
            type: 'error'
          } )
        } )
    },
    cancel: function () {
      let id = this.story.id
      this.$store.commit( 'loadStory', { id: null } )
      this.$store.dispatch( 'story', id ).then( () => {
        this.$refs.featureBox.updateCards()
      } )
    },
    update: function () {
      if ( this.$route.path.search( 'building' ) > 0 ) {
        this.path = ['Public']
        this.$store.dispatch( 'story', this.$route.params.id ).then( r => {
          let promises = []
          for ( let b in r.blocks ) {
            let c = {
              index: b,
              date_start: this.start,
              date_end: this.end,
              date_interval: this.interval,
              interval_unit: this.unit
            }
            promises.push( this.$store.dispatch( 'block', c ) )
          }

          Promise.all( promises ).then( t => {
            this.$refs.featureBox.updateCards()
            this.$refs.navdir.populate()
          } )
        } )
      } else if ( this.$route.path.search( 'compare' ) > 0 ) {
        let ids = JSON.parse( decodeURI( this.$route.params.ids ) )
        this.$store
          .dispatch( 'compare', {
            stories: ids,
            dateStart: this.start,
            dateEnd: this.end,
            interval: this.interval,
            unit: this.unit
          } )
          .then( async v => {
            // this.mediaArray = this.story.media
            // for (let chart of this.story.blocks[0].charts) {
            //   this.titles.push(chart.name)
            // }
            await v()
            this.$refs.featureBox.updateCards()
            if ( this.$refs.navdir ) {
              // this.$refs.navdir.populate()
            }
          } )
      } else {
        if ( this.$route.params.id ) {
          this.$store.dispatch( 'story', this.$route.params.id ).then( r => {
            this.$refs.featureBox.updateCards()
            if ( this.$refs.navdir ) {
              this.$refs.navdir.populate()
            }
          } )
        } else {
          this.$router.push( '/#/map' )
          // this.$store.dispatch('user').then(user => {
          //   this.$store.dispatch('stories').then(groups => {
          //     if (!this.story.id) {
          //       this.$store.dispatch('story', groups[0].stories[0].id).then(() => {
          //         this.$refs.navdir.populate()
          //       })
          //     } else {
          //       if (this.$refs.navdir) {
          //         this.$refs.navdir.populate()
          //       }
          //     }
          //   })
          // })
        }
      }
    },
    changeStory: function ( event ) {
      this.editingStory = false
      this.$store.dispatch( 'story', event[0] )
    }
  }
}
</script>

<style scoped lang="scss">
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
