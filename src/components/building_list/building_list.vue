<!--
  Filename: building_list.vue
  Info: This component shows the list of buildings for which we automatically collect data under the "buildings" tab.
-->
<template>
  <el-row class="top_row">
    <el-col :span="24" class="top_col">
      <el-row class="search_row">
        <el-col :span="24" class="search_col">
          <el-input v-model="search" class="searchInput" placeholder="Search for buildings">
            <i class="el-icon-search el-input__icon" slot="prefix"></i
            ><i
              class="el-icon-close el-input__icon"
              slot="suffix"
              @click="resetSearchInput()"
              v-if="this.search != ''"
            ></i>
          </el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="cards_col">
          <el-tabs v-model="openName" class="tab_row" v-if="buildingList" v-loading="this.loading">
            <el-tab-pane v-for="(item, key) in groups" :key="key" :name="key">
              <span slot="label" class="tab_label">{{ key }}</span>
              <el-row type="flex" justify="left" class="card_flex">
                <el-col v-for="building in item" :key="building.name" :span="4" class="card_container">
                  <viewCard
                    :plus="false"
                    :building="buildingList"
                    :id="building.id"
                    class="card"
                    @click="$router.push({ path: `/building/${building.id}/2` })"
                    ref="card"
                  />
                </el-col>
                <!-- Add some extra padding for proper alignment, this kind of an estimated number. -->
                <el-col v-for="n in 10" :key="key + n" :span="4" class="blankSlate"> &nbsp; </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
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
      search: '',
      openName: '',
      publicDir: true,
      loading: true
    }
  },
  async mounted () {
    if ( this.buildingList ) {
      await this.$store.getters['map/promise']
      if ( this.$route.params.group && this.groups[this.$route.params.group] ) {
        this.openName = this.$route.params.group
      } else {
        this.openName = Object.keys( this.groups )[0]
      }
      this.loading = false
    } else {
      await this.$store.getters['user/promise']
      this.loading = false
    }
  },
  computed: {
    buildingList: {
      get () {
        return this.$route.path.includes( 'buildings' )
      }
    },

    groups: {
      get () {
        if ( this.buildingList ) {
          let r = {}
          // await this.$store.getters['map/promise']
          let buildings = this.$store.getters['map/buildings']
          for ( let building of buildings ) {
            if ( r['All'] ) {
              r['All'].push( building )
              r['All'].sort( ( a, b ) => ( a.name > b.name ? 1 : -1 ) )
            } else {
              r['All'] = [building]
            }
            if ( r[building.group] ) {
              r[building.group].push( building )
              r[building.group].sort( ( a, b ) => ( a.name > b.name ? 1 : -1 ) )
            } else {
              r[building.group] = [building]
            }
          }
          let r2 = {
            All: r['All']
          }
          let keys = Object.keys( r ).sort()
          for ( let key of keys ) {
            if ( key !== 'All' ) r2[key] = r[key]
          }
          return r2
        } else {
          return this.$store.getters['user/views']
        }
      }
    }
  },
  watch: {
    groups: function ( value ) {
      this.search = ''
      if ( this.$route.params.group && this.groups[this.$route.params.group] ) {
        this.openName = this.$route.params.group
      } else {
        this.openName = Object.keys( this.groups )[0]
      }
    },
    search: function ( v ) {
      let groups
      if ( this.buildingList ) {
        groups = Object.values( this.groups ).reduce( ( a, c ) => {
          for ( let d of c ) a.push( d )
          return a
        }, [] )
      } else {
        groups = this.groups
      }
      let values = groups
        .filter(
          ( card, index, arr ) =>
            // Check that the item's name includes query
            ( card.name && card.name.toLowerCase().includes( v.toLowerCase() ) ) ||
            // Check that description includes query
            ( card.description && card.description.toLowerCase().includes( v.toLowerCase() ) )
        )
        .map( e => {
          return e.id
        } )
      for ( let card of this.$refs.card ) {
        if ( values.indexOf( card.id ) < 0 ) {
          card.$el.parentNode.style.display = 'none'
        } else {
          card.$el.parentNode.style.display = 'block'
        }
      }
    }
  },
  methods: {
    newView: function () {
      this.$store.dispatch( 'modalController/openModal', {
        name: 'edit_view'
      } )
    },
    resetSearchInput () {
      this.search = ''
    }
  }
}
</script>

<style lang="scss" scoped>
/*--- top level ---*/
.top_col {
  position: absolute;
  margin: 0;
  width: 100%;
  padding: 1em;
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

@media only screen and (max-width: 600px) {
  .tab_label {
    font-size: 14px;
  }
  /*-- for reducing el-tabs padding: https://www.jianshu.com/p/9db8679de026 --*/
  ::v-deep .el-tabs__item {
    padding: 0 10px;
  }
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
.el-icon-close {
  cursor: pointer;
}
::v-deep .el-input__icon {
  color: #d73f09;
}
::v-deep .el-input__suffix {
  font-size: 28px;
}
</style>
