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
      <heropicture v-loading='!building' :media='(building && building.image) ? building.image : ""' description='' :name='(building && building.name) ? building.name : ""'></heropicture>
      <!-- <navdir ref='navdir' @update='update' @save='save'></navdir> -->
    </el-col>
      <featured ref='featureBox' :compareMode="$route.path.search('compare') > 0" :blocks='(building && building.path) ? this.$store.getters[building.path + "/blocks"] : ""' />
  </el-row>
</template>

<script>
import featured from '@/components/account/featured'
import heropicture from '@/components/account/heropicture'
import navdir from '@/components/account/navdir'

export default {
  name: 'building',
  components: {
    featured,
    heropicture,
    navdir
  },
  mounted () {
    this.$nextTick(() => {
      // if (!this.building) return
      console.log(this.building.path)
      for (let block of this.$store.getters[this.building.path + '/blocks']) {
        if (!block.path) return
        
        this.$store.commit(block.path + '/dateStart', this.dateStart)
        this.$store.commit(block.path + '/dateEnd', this.dateEnd)
        this.$store.commit(block.path + '/dateInterval', this.dateInterval)
        this.$store.commit(block.path + '/intervalUnit', this.intervalUnit)
      }
    })
    
  },
  computed: {
    building: {
      get () {
        return this.$store.getters['map/buildings'].find(building => { return building.id === parseInt(this.$route.params.id) })
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
</style>