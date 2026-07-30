<!--
  Filename: BuildingView.vue
  Description: Manages the display of the building and compare views.
-->
<template>
  <el-row class="stage">
    <el-col class="main">
      <HeroPicture
        v-loading="!buildingOrCompare"
        :media="buildingOrCompare && buildingOrCompare.image ? buildingOrCompare.image : ''"
        :description="buildingOrCompare && buildingOrCompare.description ? buildingOrCompare.description : ''"
        :name="buildingOrCompare && buildingOrCompare.name ? buildingOrCompare.name : ''"
      />
      <BuildingPanelNavigation ref="BuildingPanelNavigation" v-if="navVis"></BuildingPanelNavigation>
      <el-row>
        <el-col :span="24" class="card_area">
          <BuildingPanel v-for="(card, index) in cards" :key="index + '-' + buildingOrCompare.id" :path="card.path" />
        </el-col>
      </el-row>
    </el-col>
    <BuildingCardEditModal />
  </el-row>
</template>

<script>
import BuildingPanel from '@/components/building_view/BuildingPanel.vue'
import HeroPicture from '@/components/ui/HeroPicture.vue'
import BuildingCardEditModal from '@/components/building_view/modals/EditModal.vue'
import BuildingPanelNavigation from '@/components/building_view/BuildingPanelNavigation.vue'

export default {
  components: {
    BuildingPanel,
    HeroPicture,
    BuildingPanelNavigation,
    BuildingCardEditModal
  },
  data() {
    return {
      navVis: false
    }
  },
  async created() {
    await this.$store.dispatch('map/loadMap')
    await this.hydrateRouteBuildings(this.$route)
    this.navVis = this.$route.path.includes('building') // show BuildingPanelNavigation on individual building pages only
  },
  methods: {
    hydrateRouteBuildings: async function (route) {
      if (route.path.includes('building')) {
        const buildingId = parseInt(route.params.id)
        if (!Number.isNaN(buildingId)) {
          await this.$store.dispatch('map/hydrateBuilding', buildingId)
        }
        return
      }

      if (route.path.includes('compare')) {
        let compareIds = []
        try {
          compareIds = JSON.parse(decodeURI(route.params.buildings))
        } catch (err) {
          compareIds = []
        }
        await Promise.all(
          compareIds.map(id => {
            const parsedId = parseInt(id)
            if (Number.isNaN(parsedId)) {
              return Promise.resolve()
            }
            return this.$store.dispatch('map/hydrateBuilding', parsedId)
          })
        )
      }
    },
    addFeature: function () {
      this.$store.dispatch('modalController/openModal', {
        name: 'EditModal',
        view: this.buildingOrCompare.path
      })
    }
  },
  watch: {
    $route: {
      immediate: true,
      handler: async function (to, from) {
        await this.$store.dispatch('map/loadMap')
        await this.hydrateRouteBuildings(to)
        this.navVis = this.$route.path.includes('building') // show BuildingPanelNavigation on individual building pages only
        if (this.$route.path.includes('building') || this.$route.path.includes('compare')) {
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
    buildingOrCompare: {
      immediate: true,
      handler: async function (value) {
        if (this.$route.path.includes('building')) {
          // building view
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
          // compare view
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
    // Get the building data for comparison
    compareBuildings: {
      get() {
        if (!this.$route.path.includes('compare')) return null
        return JSON.parse(decodeURI(this.$route.params.buildings)).map(id => this.$store.getters['map/building'](id))
      }
    },

    // Determine which view (Building or Compare) to show based on the route
    buildingOrCompare: {
      get() {
        // If the route is for a building, get the building data
        if (this.$route.path.includes('building')) {
          return this.$store.getters['map/building'](this.$route.params.id)
        }

        // Otherwise, get the compare data
        if (!this.cards || this.cards.length === 0) return
        const compareView = {
          name: '',
          image: [],
          description: 'Electricity',
          id: -1
        }
        for (let index in this.compareBuildings) {
          if (this.compareBuildings[index]) {
            if (index > 0) {
              compareView.name += ' vs '
            }
            compareView.name += this.compareBuildings[index].name
            if (index < 4) {
              compareView.image.push(this.compareBuildings[index].image)
            }
          }
        }
        return compareView
      }
    },

    cards: {
      get() {
        if (this.$route.path.includes('compare')) {
          if (!this.compareBuildings || this.compareBuildings.length === 0 || !this.compareBuildings[0]) {
            return []
          }
          if (this.compareBuildings.length > 1) {
            let building = this.$store.getters['map/building'](this.compareBuildings[0].id)
            if (!building) return []
            let group = this.$store.getters[building.path + '/primaryGroup']('Electricity')
            if (!group) return []
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
          if (!this.buildingOrCompare || !this.buildingOrCompare.id) return []
          return this.$store.getters[this.buildingOrCompare.path + '/blocks']
        }
      }
    },
    dateStart: {
      get() {
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
      get() {
        let d = new Date()
        return d.getTime()
      }
    },
    intervalUnit: {
      get() {
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
      get() {
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
</style>
