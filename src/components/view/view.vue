/*
 * @Author: Brogan
 * @Date:   Monday September 30th 2019
 * @Last Modified By:  Brogan
 * @Last Modified Time:  Monday September 30th 2019
 * @Copyright:  Oregon State University 2019
 */

<template>
  <el-row class="stage">
    <el-col class='main'>
      <heropicture v-loading='!view' :media='(view && view.image) ? view.image : ""' :description='(view && view.description) ? view.description : ""' :name='(view && view.name) ? view.name : ""' />
      <navdir ref='navdir' v-if="(personalView || $route.path.includes('building'))"></navdir>
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
  mounted () {
    this.$nextTick(() => {
      if (!this.view || this.view.id !== this.$route.params.id) {
        this.$store.dispatch('view/changeView', this.$route.params.id)
      }
    })
    // this.$nextTick(() => {
    //   if (!this.view || !this.view.path || !this.$route.path.includes('building')) {
    //     return
    //   }
    //   for (let card of this.cards) {
    //     if (!card.path) return
    //     this.$store.commit(card.path + '/dateStart', this.dateStart)
    //     this.$store.commit(card.path + '/dateEnd', this.dateEnd)
    //     this.$store.commit(card.path + '/dateInterval', this.dateInterval)
    //     this.$store.commit(card.path + '/intervalUnit', this.intervalUnit)
    //   }
    // })
    // if (!this.$route.path.includes('building')) {
    //   // May want to move this await to use the promise thing
    //   this.$store.dispatch('view/changeView', this.$route.params.id)
    // }
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
    $route (to, from) {
      if (!this.view || this.view.id !== this.$route.params.id) {
        this.$store.dispatch('view/changeView', this.$route.params.id)
      }
    },
    view: {
      immediate: true,
      handler: async function (value) {
        if (!this.$route.path.includes('building')) return
        for (let card of this.cards) {
          if (!card.path) return
          await card.promise
          this.$store.commit(card.path + '/dateStart', this.dateStart)
          this.$store.commit(card.path + '/dateEnd', this.dateEnd)
          this.$store.commit(card.path + '/dateInterval', this.dateInterval)
          this.$store.commit(card.path + '/intervalUnit', this.intervalUnit)
        }
      }
    }
  },
  computed: {
    personalView: {
      get () {
        if (this.view.user === this.$store.getters['user/onid']) {
          return true
        }
        return false
      }
    },
    view: {
      get () {
        if (this.$route.path.includes('building')) {
          return this.$store.getters['map/building'](this.$route.params.id)
        } else {
          let userView = this.$store.getters['user/view'](this.$route.params.id)
          if (userView) return userView
          else return this.$store.getters['view']
        }
      }
    },
    cards: {
      get () {
        return this.$store.getters[this.view.path + '/blocks']
      }
    },
    dateStart: {
      get () {
        let d = new Date()
        switch (parseInt(this.$route.params.range)) {
          case 1:
            d.setDate(d.getDate() - 7)
            break
          case 2:
            d.setMonth(d.getMonth() - 1)
            break
          case 3:
            d.setFullYear(d.getFullYear() - 1)
            break
          default:
            break
        }
        return d.toISOString()
      }
    },
    dateEnd: {
      get () {
        let d = new Date()
        return d.toISOString()
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
