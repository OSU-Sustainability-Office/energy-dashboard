/*
 * @Author: Brogan Miner
 * @Date:   Friday December 13th 2019
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Friday December 13th 2019
 * @Copyright:  (c) Oregon State University 2019
 */

<template>
  <el-row class='top_row'>
    <el-col :span='24' class='top_col'>
      <el-row class='search_row'>
        <el-col :span='24' class='search_col'>
          <el-input v-model='search'>
            <i class="el-icon-search el-input__icon" slot="prefix"></i>
          </el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span='24' class='cards_col'>
          <el-tabs v-model='openName' class='tab_row' v-if='buildingList'>
            <el-tab-pane v-for='(item, key) in groups' :key='key' :name='key'>
              <span slot='label' class='tab_label'>{{ key }}</span>
              <el-row type='flex' justify='left' class='card_flex'>
                <el-col v-for='building in item' :key='building.name' :span='4' class='card_container'>
                  <viewCard :plus='false' :building='buildingList' :id='building.id' class='card' @click='$router.push({ path: `/building/${building.id}/1` })' ref='card' />
                </el-col>
                <!-- <el-col v-if='!publicDir' :span='4' class='card_container'>
                  <el-tooltip content="Create New View" placement="top">
                    <viewCard :plus='true' :notools='1' class='storyCard' @click="openStoryEdit('', '', '', null)"/>
                  </el-tooltip>
                </el-col> -->
                <!-- Add some extra padding for proper alignment, this kind of an estimated number. -->
                <el-col v-for='n in 10' :key='key + n' :span='4' class='blankSlate'>
                  &nbsp;
                </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
          <el-row type='flex' justify='left' class='card_flex' v-if='!buildingList' v-loading='this.groups.length === 0'>
            <el-col v-for='view in groups' :key='view.name' :span='4' class='card_container'>
              <viewCard :plus='false' :building='buildingList' :id='view.id' class='card' @click='$router.push({ path: `/view/${view.id}/1` })' ref='card' />
            </el-col>
            <el-col :span='4' class='card_container'>
              <!-- <el-tooltip content="Create New View" placement="top"> -->
                <viewCard :plus='true' :notools='1' class='card' :building='false' :id='1' />
              <!-- </el-tooltip> -->
            </el-col>
            <el-col v-for='n in 10' :key='n' :span='4' class='blankSlate'>
              &nbsp;
            </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import viewCard from '@/components/building_list/view_card.vue'
export default {
  components: {
    viewCard
  },
  data () {
    return {
      groups: {},
      search: '',
      openName: '',
      publicDir: true
    }
  },
  async mounted () {
    console.log(this.$store.getters['user/promise'])
    if (!this.buildingList) {
      this.groups = []
      await this.$store.getters['user/promise']
      this.groups = this.$store.getters['user/views']
    } else {
      await this.$store.getters['map/promise']
      let buildings = this.$store.getters['map/buildings']
      for (let building of buildings) {
        if (this.groups[building.group]) {
          this.groups[building.group].push(building)
        } else {
          this.groups[building.group] = [building]
        }
      }
      if (this.$route.params.group && this.groups[this.$route.params.group]) {
        this.openName = this.$route.params.group
      } else {
        this.openName = Object.keys(this.groups)[0]
      }
    }
  },
  computed: {
    buildingList: {
      get () {
        return this.$route.path.includes('buildings')
      }
    }
  },
  watch: {
    search: function (v) {
      let values = this.groups[this.openName].filter((card, index, arr) => (
        // Check that the item's name includes query
        (card.name && card.name.toLowerCase().includes(v.toLowerCase())) ||
        // Check that description includes query
        (card.description && card.description.toLowerCase().includes(v.toLowerCase()))
      )).map(e => {
        return e.name
      })
      for (let card of this.$refs.card) {
        if (values.indexOf(card.name) < 0) {
          card.$el.parentNode.style.display = 'none'
        } else {
          card.$el.parentNode.style.display = 'block'
        }
      }
    }
  }
}
</script>

<style lang='scss' scoped>
/*--- top level ---*/
.top_col {
  position: absolute;
  margin: 0;
  width: 100vw;
  padding: 0;
}

/*HEADER*/
.search_row {
  margin: 0;
  padding-top: 1em;
  width: 100%;
}
.search_col {
  padding: 0.5em;
}

/* MAIN */
.cards_col {
  padding: 0.5em;
  width: 100%;
}
/*--- Tabs   ---*/
.tab_label {
  font-size: 16px;
}

/*--- Flex Box   ---*/
.card_flex {
    flex-wrap: wrap !important;
    overflow-x: hidden;
}
.card_flex > * {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  min-width: 300px;
}

/*--- Cards   ---*/
.card_container {
  padding: 0.5em;
}
.card {
  margin: auto;
  cursor: pointer;
}
.card:hover {
  border-color: $--color-primary;
  outline: solid 3px $--color-primary;
  outline-offset: -5px;
}
.blankSlate {
  padding-right: 0.5em;
  padding-left: 0.5em;
}
.blankGroups {
  font-size: 22px;
  position: relative;
  top: 1em;
  width: 100%;
  text-align: center;
}
</style>
