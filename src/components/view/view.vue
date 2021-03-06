<template>
  <el-row class="stage">
    <el-col class='main'>
      <heropicture v-loading='!view' :media='(view && view.image) ? view.image : ""' :description='(view && view.description) ? view.description : ""' :name='(view && view.name) ? view.name : ""' />
      <navdir ref='navdir' v-if="navVis"></navdir>
      <el-row>
        <el-col :span='24' class='card_area'>
          <card v-for='(card, index) in cards' :key='index + "-" + view.id' :path='card.path' />
          <div class="addFeatured" v-if='personalView' key="add" @click="addFeature()">
            <i class="fas fa-plus"></i>
            <div class='hiddenAddChart'>Click To Add Block</div>
          </div>
        </el-col>
      </el-row>
    </el-col>
    <editCard />
      <!-- <featured ref='featureBox' :compareMode="$route.path.search('compare') > 0" :blocks='(building && building.path) ? this.$store.getters[building.path + "/blocks"] : ""' /> -->
  </el-row>
</template>

<script>
import card from '@/components/view/card'
import heropicture from '@/components/extras/heropicture'
import navdir from '@/components/view/navdir'
import editCard from '@/components/view/modals/edit_card'

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
    this.navVis = (this.personalView || this.$route.path.includes('building') || this.otherView)
    await this.$store.dispatch('user/user')
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
        if (!this.$route.path.includes('building') && !this.$route.path.includes('compare') && (!this.view || this.view.id !== parseInt(this.$route.params.id))) {
          this.$store.dispatch('view/changeView', this.$route.params.id)
        } else if (this.$route.path.includes('building') || this.$route.path.includes('compare')) {
          for (let card of this.cards) {
            this.$store.commit(card.path + '/dateStart', this.dateStart)
            this.$store.commit(card.path + '/dateEnd', this.dateEnd)
            this.$store.commit(card.path + '/dateInterval', this.dateInterval)
            this.$store.commit(card.path + '/intervalUnit', this.intervalUnit)
          }
        }
      }
    },
    compareBuildings: {
      immediate: true,
      handler: async function (buildings) {
        if (this.$route.path.includes('compare')) {
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
        }
      }
    }
  },
  computed: {
    personalView: {
      get () {
        if (this.view && this.view.user === this.$store.getters['user/onid'] && this.$store.getters['user/onid'] !== '') {
          return true
        }
        return false
      }
    },
    otherView: {
      get () {
        if (this.view.path === 'view') {
          return true
        }
        return false
      }
    },
    view: {
      get () {
        if (this.$route.path.includes('building')) {
          return this.$store.getters['map/building'](this.$route.params.id)
        } else if (this.$route.path.includes('compare')) {
          if (!this.cards || this.cards.length === 0) return
          const view = {
            name: '',
            image: [],
            description: 'Electrcity',
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
        } else {
          let userView = this.$store.getters['user/view'](this.$route.params.id)
          if (userView) return userView
          else return this.$store.getters['view']
        }
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
          if (!this.compareBuildings || this.compareBuildings.length === 0 || !this.compareBuildings[0]) return []
          let building = this.$store.getters['map/building'](this.compareBuildings[0].id)
          if (!building) return []
          let group = this.$store.getters[building.path + '/primaryGroup']('Electricity')
          let block = this.$store.getters[building.path + '/block'](group.id)
          if (!block) return []
          return [this.$store.getters[building.path + '/block'](group.id)]
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
          case 2:
            startModifier = 60 * 24 * 60 * 60 * 1000
            break
          case 3:
            startModifier = 365 * 24 * 60 * 60 * 1000
            break
          default:
            break
        }
        return (new Date(this.dateEnd)).getTime() - startModifier
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

<style scoped lang='scss'>
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
.card_area {
  padding: 2em;
}
.addFeatured {
  background-color: $--color-black;
  height: calc(400px + 0.8em);
  color: $--color-primary;
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
  border: solid 1px $--color-primary;
  outline: solid 3px $--color-primary;
  outline-offset: -4px;
}
.addFeatured:hover .fas {
  color: $--color-white;
}
.hiddenAddChart {
  display: none;
  font-size: 0.2em;
}
.addFeatured:hover .hiddenAddChart {
  display: block;
}
.addFeatured:hover {
  color: #C72F09;
}
.addFeatured:active {
  color: #d76740;
}
</style>
