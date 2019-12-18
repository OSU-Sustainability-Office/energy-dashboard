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
      <navdir ref='navdir'></navdir>
      <el-row>
        <el-col :span='24' class='card_area'>
          <card v-for='(card, index) in cards' :key='index' :path='card.path' />
        </el-col>
      </el-row>
    </el-col>
      <!-- <featured ref='featureBox' :compareMode="$route.path.search('compare') > 0" :blocks='(building && building.path) ? this.$store.getters[building.path + "/blocks"] : ""' /> -->
  </el-row>
</template>

<script>
import card from '@/components/view/card'
import heropicture from '@/components/extras/heropicture'
import navdir from '@/components/view/navdir'

export default {
  components: {
    card,
    heropicture,
    navdir
  },
  async mounted () {
    this.$nextTick(() => {
      if (!this.view || this.view.path || !this.$route.path.includes('building')) return
      for (let card of this.cards) {
        if (!card.path) return
        this.$store.commit(card.path + '/dateStart', this.dateStart)
        this.$store.commit(card.path + '/dateEnd', this.dateEnd)
        this.$store.commit(card.path + '/dateInterval', this.dateInterval)
        this.$store.commit(card.path + '/intervalUnit', this.intervalUnit)
      }
    })
    if (!this.$route.path.includes('building')) {
      // May want to move this await to use the promise thing
      await this.$store.dispatch('view/changeView', this.$route.params.id)
    }
  },
  computed: {
    view: {
      get () {
        if (this.$route.path.includes('building')) {
          return this.$store.getters['map/building'](this.$route.params.id)
        } else {
          return this.$store.getters['view/state']
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
    },
    dateInterval: {
      get () {
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
</style>
