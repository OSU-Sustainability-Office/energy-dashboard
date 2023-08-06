<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-11T10:22:10-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-12T14:50:28-08:00
-->

<template>
  <el-row>
    <el-col :span="24">
      <el-row>
        <el-col :span="20">
          <el-input placeholder="Search" prefix-icon="el-icon-search" v-model="search"> </el-input>
        </el-col>
        <el-col :span="4">
          <el-button @click="editBuilding(null)" type="primary" class="newButton"> New Building </el-button>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span="24" class="cards_col">
          <el-row type="flex" justify="left" class="card_flex" v-loading="this.loading">
            <el-col
              v-for="building in buildings"
              :key="building.name"
              :id="building.id"
              :span="4"
              class="card_container"
              ref="card_container"
            >
              <viewCard
                :plus="false"
                :building="true"
                :id="building.id"
                class="card"
                @click="editBuilding(building.id)"
                ref="card"
              />
            </el-col>
            <el-col v-for="n in 10" :key="n" :span="4" class="blankSlate"> &nbsp; </el-col>
          </el-row>
        </el-col>
      </el-row>
    </el-col>
    <editBuilding />
  </el-row>
</template>

<script>
import editBuilding from '@/components/admin/modals/edit_building.vue'
import viewCard from '@/components/building_list/view_card.vue'

export default {
  name: 'buildings',
  components: {
    viewCard,
    editBuilding
  },
  props: [],
  data () {
    return {
      buildingEditShow: false,
      loading: true,
      search: ''
    }
  },
  async created () {
    await this.$store.getters['map/promise']
    this.loading = false
  },
  methods: {
    editBuilding: function ( building ) {
      this.$store.dispatch( 'modalController/openModal', {
        name: 'edit_building',
        id: building
      } )
    }
  },
  watch: {
    search: function ( v ) {
      let values = this.buildings
        .filter(
          obj =>
            // Check that the item's name includes query
            obj.name && obj.name.toLowerCase().includes( v.toLowerCase() )
        )
        .map( e => {
          return e.id
        } )
      for ( let row of this.$refs.card_container ) {
        if ( values.indexOf( row.$attrs.id ) < 0 ) {
          row.$el.style.display = 'none'
        } else {
          row.$el.style.display = 'block'
        }
      }
    }
  },
  computed: {
    buildings: {
      get () {
        return this.$store.getters['map/buildings']
      }
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang="scss">
.newButton {
  margin-left: 1em;
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
.cards_col {
  padding: 0.5em;
  width: 100%;
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
