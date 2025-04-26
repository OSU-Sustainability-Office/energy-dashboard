<template>
  <el-row class="stage">
    <el-col class="main">
      <heropicture
        v-loading="!view"
        :media="view && view.image ? view.image : ''"
        :description="view && view.description ? view.description : ''"
        :name="view && view.name ? view.name : ''"
      />
      <navdir ref="navdir" v-if="navVis"></navdir>
      <el-row>
        <el-col :span="24" class="card_area">
          <card v-for="(card, index) in cards" :key="index + '-' + view.id" :path="card.path" />
        </el-col>
      </el-row>
    </el-col>
    <editCard />
    <!-- <featured ref='featureBox' :compareMode="$route.path.search('compare') > 0" :blocks='(building && building.path) ? this.$store.getters[building.path + "/blocks"] : ""' /> -->
  </el-row>
</template>

<script>
import card from '@/components/view/card.vue'
import heropicture from '@/components/extras/heropicture.vue'
import editCard from '@/components/view/modals/edit_card.vue'
import navdir from '@/components/view/navdir.vue'

export default {
  components: {
    card,
    heropicture,
    navdir,
    editCard
  },
  data () {
    return {
      navVis: false
    }
  },
  async created () {
    await this.$store.dispatch('map/loadMap')
    // Currently, this.navVis is just set to show the navdir on "building" page, and hide on other pages.
    // If you want to configure different navdir behavior on the comparison page, e.g. show "share button"
    // but not other buttons on navdir, then you may as well just set this.navVis to true here,
    // and remove references to navVis in watch > $route section (20 lines or so below), then configure
    // this.otherView (or whatever) in navdir.vue file.
    // However, this.navVis is still needed here as it guarantees the navbar is not shown before
    // await this.$store.dispatch('map/loadMap') completes, preventing errors in navdir file.
    this.navVis = this.$route.path.includes('building')
    if (!this.view.id) {
      await this.$store.dispatch('view/changeView', this.$route.params.id)
    }
  },
  methods: {
    addFeature: function () {
      this.$store.dispatch('modalController/openModal', {
        name: 'edit_card',
        view: this.view.path
      })
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler: async function (to, from) {
        this.navVis = this.$route.path.includes('building')
        if (
          !this.$route.path.includes('building') &&
          !this.$route.path.includes('compare') &&
          (!this.view || this.view.id !== parseInt(this.$route.params.id))
        ) {
          this.$store.dispatch('view/changeView', this.$route.params.id)
        } else if (this.$route.path.includes('building') || this.$route.path.includes('compare')) {
          for (let card of this.cards) {
            this.$store.commit(card.path + '/dateStart', this.dateStart)
            this.$store.commit(card.path + '/dateEnd', this.dateEnd)
            this.$store.commit(card.path + '/dateInterval', this.dateInterval)
            this.$store.commit(card.path + '/intervalUnit', this.intervalUnit)
          }
        }
        // Reset multStart and multEnd variables whenever you change pages
        for (let card of this.cards) {
          if (!card.path) return
          this.$nextTick(() => {
            let blockpath = card.path
            let searchTerm = 'block_'
            let chartIndex = blockpath.indexOf(searchTerm)
            let blockID = blockpath.slice(chartIndex + searchTerm.length)
            this.$store.commit(blockpath + '/chart_' + blockID + '/resetMultTimeStamps')
          })
        }
      }
    },
    compareBuildings: {
      immediate: true,
      handler: async function (buildings) {
        if (this.$route.path.includes('compare')) {
          if (buildings.length > 1) {
            if (this.cards.length > 0 && this.cards[0]) {
              await this.$store.dispatch(this.cards[0].path + '/removeAllModifiers')
              await this.$store.dispatch(this.cards[0].path + '/addModifier', 'building_compare')
              await this.$store.dispatch(this.cards[0].path + '/updateModifier', {
                name: 'building_compare',
                data: {
                  buildingIds: buildings.map(building => building.id)
                }
              })
            }
          } else {
            for (let i in this.cards) {
              if (this.cards.length > 0 && this.cards[i]) {
                await this.$store.dispatch(this.cards[i].path + '/removeAllModifiers')
                await this.$store.dispatch(this.cards[i].path + '/addModifier', 'building_compare')

                // Example this.cards[i].path: map/building_29/block_79
                // Example call order: view.vue's compareBuildings() > map.module.js's building() getter >
                // building.module.js's block () getter > block.module.js's updateModifier >
                // building_compare.mod.js's updateData() > building_compare.mod.js's addCharts() >
                // block.module.js's loadCharts()

                await this.$store.dispatch(this.cards[i].path + '/updateModifier', {
                  name: 'building_compare',
                  data: {
                    buildingIds: buildings.map(building => building.id)
                  }
                })
              }
            }
          }
        }
      }
    },
    view: {
      immediate: true,
      handler: async function (value) {
        if (this.$route.path.includes('building')) {
          for (let card of this.cards) {
            if (!card.path) return
            if (card.promise) await card.promise

            await this.$store.dispatch(card.path + '/resetDefault')
            this.$store.commit(card.path + '/dateStart', this.dateStart)
            this.$store.commit(card.path + '/dateEnd', this.dateEnd)
            this.$store.commit(card.path + '/dateInterval', this.dateInterval)
            this.$store.commit(card.path + '/intervalUnit', this.intervalUnit)
          }
        } else if (!this.$route.path.includes('compare')) {
          for (let card of this.cards) {
            await this.$store.dispatch(card.path + '/removeAllModifiers')
          }
        } else {
          for (let card of this.cards) {
            if (!card.path) return
            this.$nextTick(() => {
              this.$store.commit(card.path + '/dateStart', this.dateStart)
              this.$store.commit(card.path + '/dateEnd', this.dateEnd)
              this.$store.commit(card.path + '/dateInterval', this.dateInterval)
              this.$store.commit(card.path + '/intervalUnit', this.intervalUnit)
            })
          }
          // Reset multStart and multEnd variables whenever you change pages
          for (let card of this.cards) {
            if (!card.path) return
            this.$nextTick(() => {
              let blockpath = card.path
              let searchTerm = 'block_'
              let chartIndex = blockpath.indexOf(searchTerm)
              let blockID = blockpath.slice(chartIndex + searchTerm.length)
              this.$store.commit(blockpath + '/chart_' + blockID + '/resetMultTimeStamps')
            })
          }
        }
      }
    }
  },
  computed: {
    view: {
      get () {
        // If the view is a building, get the building data
        if (this.$route.path.includes('building')) {
          return this.$store.getters['map/building'](this.$route.params.id)
        }

        // Otherwise, get the compare view data
        if (!this.cards || this.cards.length === 0) return
        const view = {
          name: '',
          image: [],
          description: 'Electricity',
          id: -1
        }
        for (let index in this.compareBuildings) {
          if (this.compareBuildings[index]) {
            if (index > 0) {
              view.name += ' vs '
            }
            view.name += this.compareBuildings[index].name
            if (index < 4) {
              view.image.push(this.compareBuildings[index].image)
            }
          }
        }
        return view
      }
    },
    compareBuildings: {
      get () {
        if (!this.$route.path.includes('compare')) return null
        return JSON.parse(decodeURI(this.$route.params.buildings)).map(id => this.$store.getters['map/building'](id))
      }
    },
    cards: {
      get () {
        if (this.$route.path.includes('compare')) {
          if (!this.compareBuildings || this.compareBuildings.length === 0 || !this.compareBuildings[0]) {
            return []
          }
          if (this.compareBuildings.length > 1) {
            let building = this.$store.getters['map/building'](this.compareBuildings[0].id)
            if (!building) return []
            let group = this.$store.getters[building.path + '/primaryGroup']('Electricity')
            let block = this.$store.getters[building.path + '/block'](group.id)
            if (!block) return []
            // Load only one (electricity) card for multiple buildings, one time period comparison
            return [this.$store.getters[building.path + '/block'](group.id)]
          } else {
            let building = this.$store.getters['map/building'](this.compareBuildings[0].id)
            if (!building) return []
            // Load one or more cards (one for each energy type) for one building, multiple time period comparison
            return this.$store.getters[building.path + '/blocks']
          }
        } else {
          if (!this.view || !this.view.id) return []
          return this.$store.getters[this.view.path + '/blocks']
        }
      }
    },
    dateStart: {
      get () {
        let startModifier = 7 * 24 * 60 * 60 * 1000
        switch (parseInt(this.$route.params.range)) {
          case 1:
            startModifier = 7 * 24 * 60 * 60 * 1000
            break
          case 4:
          case 2:
            startModifier = 60 * 24 * 60 * 60 * 1000
            break
          case 3:
            startModifier = 365 * 24 * 60 * 60 * 1000
            break
          default:
            break
        }
        return new Date(this.dateEnd).getTime() - startModifier
      }
    },
    dateEnd: {
      get () {
        let d = new Date()
        return d.getTime()
      }
    },
    intervalUnit: {
      get () {
        switch (parseInt(this.$route.params.range)) {
          case 1:
            return 'hour'
          case 2:
            return 'day'
          case 3:
            return 'day'
          default:
            return 'minute'
        }
      }
    },
    dateInterval: {
      get () {
        switch (parseInt(this.$route.params.range)) {
          case 1:
            return 1
          case 4:
          case 2:
            return 1
          case 3:
            return 7
          default:
            return 15
        }
      }
    }
  }
}
</script>

<style scoped lang="scss">
.stage {
  position: absolute;
  top: 0;
  left: 0;
  height: calc(100vh - #{$nav-height});
  width: 100%;
  margin: 0;
  padding: 0;
}
.main {
  padding: 0;
}
.card_area {
  padding: 2em;
}
.addFeatured {
  background-color: $color-black;
  height: calc(400px + 0.8em);
  color: $color-primary;
  margin-top: 0.1em;
  margin-bottom: 0.1em;
  border-radius: 5px;
  text-align: center;
  font-size: 10em;
  cursor: pointer;
}
.addFeatured .fas {
  margin-top: 1em;
}
.addFeatured:hover {
  border: solid 1px $color-primary;
  outline: solid 3px $color-primary;
  outline-offset: -4px;
}
.addFeatured:hover .fas {
  color: $color-white;
}
.hiddenAddChart {
  display: none;
  font-size: 0.2em;
}
.addFeatured:hover .hiddenAddChart {
  display: block;
}
.addFeatured:hover {
  color: #c72f09;
}
.addFeatured:active {
  color: #d76740;
}
</style>
