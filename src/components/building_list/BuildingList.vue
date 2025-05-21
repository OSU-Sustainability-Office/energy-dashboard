<!--
  Filename: BuildingList.vue
  Info: This component shows the list of buildings for which we automatically collect data under the "buildings" tab.
-->
<template>
  <el-row class="top_row">
    <el-col :span="24" class="top_col">
      <el-row class="search_row">
        <el-col :span="24" class="search_col">
          <el-input v-model="search" class="searchInput" placeholder="Search for buildings">
            <template v-slot:prefix>
              <el-icon><SearchIcon /></el-icon>
            </template>
            <template #suffix>
              <el-icon v-if="search !== ''" @click="search = ''"><CloseIcon /></el-icon>
            </template>
          </el-input>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="cards_col">
          <el-tabs v-model="openName" class="tab_row" v-if="buildingList" v-loading="this.loading">
            <el-tab-pane v-for="(item, key) in groups" :key="key" :name="key">
              <template #label>
                <span class="tab_label">{{ key }}</span>
              </template>
              <el-radio v-model="search" label="">All</el-radio>
              <el-radio v-model="search" label="Electricity">Electricity</el-radio>
              <el-radio v-model="search" label="Steam">Steam</el-radio>
              <el-radio v-model="search" label="Solar Panel">Solar</el-radio>
              <el-radio v-model="search" label="Gas">Gas</el-radio>
              <el-row justify="start" class="card_flex">
                <el-col v-for="building in item" :key="building.name" class="card_container">
                  <BuildingListItem
                    :plus="false"
                    :building="buildingList"
                    :id="building.id"
                    class="card"
                    @click="$router.push({ path: `/building/${building.id}/2` })"
                    ref="card"
                  />
                </el-col>
                <!-- Add some extra padding for proper alignment, this kind of an estimated number. -->
                <el-col v-for="n in 10" :key="key + n" class="blankSlate"> &nbsp; </el-col>
              </el-row>
            </el-tab-pane>
          </el-tabs>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import BuildingListItem from '@/components/building_list/BuildingListItem.vue'
import { Search as SearchIcon, Close as CloseIcon } from '@element-plus/icons-vue'

export default {
  components: {
    BuildingListItem,
    SearchIcon,
    CloseIcon
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
    await this.$store.getters['map/promise']
    if (this.$route.params.group && this.groups[this.$route.params.group]) {
      this.openName = this.$route.params.group
    } else {
      this.openName = Object.keys(this.groups)[0]
    }
    this.loading = false
  },
  computed: {
    buildingList: {
      get () {
        return this.$route.path.includes('buildings')
      }
    },

    groups: {
      get () {
        const groupedBuildings = { All: [] }
        const buildings = this.$store.getters['map/buildings']

        for (const building of buildings) {
          groupedBuildings.All.push(building)
          if (!groupedBuildings[building.group]) {
            groupedBuildings[building.group] = []
          }
          groupedBuildings[building.group].push(building)
        }

        // Sort each group's buildings by name
        for (const group in groupedBuildings) {
          groupedBuildings[group].sort((a, b) => a.name.localeCompare(b.name))
        }

        // Create a new object with 'All' first, then the rest alphabetically
        const sortedGroups = { All: groupedBuildings.All }
<<<<<<< HEAD
        const groupKeys = Object.keys(groupedBuildings).filter(k => k !== 'All').sort()
=======
        const groupKeys = Object.keys(groupedBuildings)
          .filter(k => k !== 'All')
          .sort()
>>>>>>> master
        for (const key of groupKeys) {
          sortedGroups[key] = groupedBuildings[key]
        }

        return sortedGroups
      }
    }
  },
  watch: {
    groups: function (value) {
      this.search = ''
      if (this.$route.params.group && this.groups[this.$route.params.group]) {
        this.openName = this.$route.params.group
      } else {
        this.openName = Object.keys(this.groups)[0]
      }
    },
    search: function (v) {
      let groups
      if (this.buildingList) {
        groups = Object.values(this.groups).reduce((a, c) => {
          for (let d of c) a.push(d)
          return a
        }, [])
      } else {
        groups = this.groups
      }
      let values = groups
        .filter(
          (card, index, arr) =>
            // Check that the item's name includes query
            (card.name && card.name.toLowerCase().includes(v.toLowerCase())) ||
            // Check that description includes query
            (card.description && card.description.toLowerCase().includes(v.toLowerCase()))
        )
        .map(e => {
          return e.id
        })
      for (let card of this.$refs.card) {
        if (values.indexOf(card.id) < 0) {
          card.$el.parentNode.style.display = 'none'
        } else {
          card.$el.parentNode.style.display = 'block'
        }
      }
    }
  },
  methods: {
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
  :deep(.el-tabs__item) {
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
:deep(.el-icon) {
  color: #d73f09;
  cursor: pointer;
}
:deep(.el-input__suffix .el-icon) {
  font-size: 28px;
}
</style>
