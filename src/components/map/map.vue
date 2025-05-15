<template>
  <el-row class="stage">
    <el-col :span="24">
      <el-menu
        v-if="message === true"
        class="sideMenu"
        mode="vertical"
        backgroundColor="#1A1A1A"
        @select="handleSelect"
      >
        <div class="colorByTitle">Group By:</div>
        <div class="searchResultDiv">
          <p
            class="searchMapResult"
            v-for="searchGroup of this.searchGroup.slice(0, 7)"
            @click="getResult(searchGroup)"
            :key="searchGroup.feature.properties.name"
          >
            <span class="longBuildingName" v-if="searchGroup.feature.properties.name.length > 29">{{
              searchGroup.feature.properties.name
            }}</span>
            <span v-else>{{ searchGroup.feature.properties.name }}</span>
          </p>
        </div>
        <el-input v-model="search" class="searchMapInput" placeholder="Search for buildings">
          <template #prefix>
            <el-icon class="searchIcon"><SearchIcon /></el-icon>
          </template>
          <template #suffix>
            <el-icon v-if="search !== ''" @click="search = ''" class="closeIcon"><CloseIcon /></el-icon>
          </template>
        </el-input>
        <switchButtons :titles="['Category', 'Energy Trend']" v-model="grouping" />
        <el-menu-item-group v-if="grouping === 'Category'">
          <el-tooltip content="Click to toggle visibility" placement="right">
            <el-menu-item index="Academics" :class="[isDisplayed('Academics') ? 'active' : 'notactive']"
              ><span class="academics swatch"></span>Academics</el-menu-item
            >
          </el-tooltip>
          <el-menu-item
            index="Events & Engagement"
            :class="[isDisplayed('Events & Engagement') ? 'active' : 'notactive']"
            ><span class="events_engagement swatch"></span>Events & Engagement</el-menu-item
          >
          <el-menu-item index="Admin & Operations" :class="[isDisplayed('Admin & Operations') ? 'active' : 'notactive']"
            ><span class="admin_operations swatch"></span>Admin & Operations</el-menu-item
          >
          <el-menu-item index="Residential Life" :class="[isDisplayed('Residential Life') ? 'active' : 'notactive']"
            ><span class="residential swatch"></span>Residential Life</el-menu-item
          >
          <div class="energyRadioGroup">
            <div class="colorByTitle">Energy Type:</div>
            <div class="energyRadioButtons">
              <el-radio v-model="selectedOption" label="All">All</el-radio>
              <el-radio v-model="selectedOption" label="Electricity">Electricity</el-radio>
              <el-radio v-model="selectedOption" label="Steam">Steam</el-radio>
              <el-radio v-model="selectedOption" label="Solar Panel">Solar</el-radio>
              <el-radio v-model="selectedOption" label="Gas">Gas</el-radio>
            </div>
          </div>
        </el-menu-item-group>
        <el-menu-item-group v-if="grouping === 'Energy Trend'">
          <el-col class="trendBox">
            <div class="trendGradient">&nbsp;</div>
            <div class="trendTopLabel">
              Reducing Energy <br />
              Usage
            </div>
            <div class="trendBottomLabel">
              Increasing Energy <br />
              Usage
            </div>
          </el-col>
          <!-- <el-tooltip content="Click to toggle visibility" placement="right">
            <el-menu-item index='Down Trend' :class="[(isDisplayed('Down Trend') ? 'active' : 'notactive')]"><span class='down swatch'></span>Down Trend</el-menu-item>
          </el-tooltip>
          <el-menu-item index='Stable Trend' :class="[(isDisplayed('Stable Trend') ? 'active' : 'notactive')]"><span class='stable swatch'></span>Stable Trend</el-menu-item>
          <el-menu-item index='Up Trend' :class="[(isDisplayed('Up Trend') ? 'active' : 'notactive')]"><span class='up swatch'></span>Up Trend</el-menu-item> -->
        </el-menu-item-group>
      </el-menu>

      <div class="mapContainer" ref="mapContainer" v-loading="!mapLoaded">
        <l-map style="height: 100%; width: 100%" :zoom="zoom" :center="center" ref="map" @ready="updateMapRef">
          <button class="resetMapButton" @click="resetMap()">Reset Map</button>
          <compareButton @startCompare="startCompare"></compareButton>
          <div @click="resetSearchInput()">
            <leftBuildingMenu class="hideMenuButton" />
          </div>
          <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
          <l-geo-json
            v-for="building of filteredBuildings"
            :key="building.id * rKey"
            :geojson="building.geoJSON"
            :options="buildingOptions"
            ref="geoLayer"
          ></l-geo-json>
        </l-map>
      </div>
      <prompt
        :compareStories="compareStories"
        v-if="askingForComparison"
        @cancel="stopCompare"
        @compare="showComparison"
      />
      <prompt_error v-if="building_compare_error" @cancel="stopCompareError" @compare="showComparison" />
      <transition-group name="side" tag="div">
        <compareSide
          v-if="showCompareSide"
          key="compareSide"
          @hide="showCompareSide = false"
          :compareStories="compareStories"
        />
        <sideView ref="sideview" v-if="showSide" key="sideView" @hide="showSide = false" @startCompare="startCompare" />
      </transition-group>
    </el-col>
  </el-row>
</template>
<script>
import { LMap, LTileLayer, LGeoJson } from '@vue-leaflet/vue-leaflet'
import sideView from '@/components/map/sideView.vue'
import compareButton from '@/components/map/compareButton.vue'
import prompt from '@/components/map/map_prompt.vue'
import prompt_error from '@/components/map/prompt_error.vue'
import compareSide from '@/components/map/map_compareside.vue'
import L from 'leaflet'
import switchButtons from '@/components/map/switch_buttons.vue'
import emitter from '../../event-bus'
import leftBuildingMenu from '@/components/leftBuildingMenu.vue'
import { Search as SearchIcon, Close as CloseIcon } from '@element-plus/icons-vue'

const DEFAULT_LAT = 44.56335
const DEFAULT_LON = -123.2858
const DEFAULT_ZOOM = 15.5

export default {
  name: 'featured',
  props: {
    msg: {
      type: String
    }
  },
  components: {
    LMap,
    LTileLayer,
    sideView,
    LGeoJson,
    prompt,
    prompt_error,
    compareSide,
    switchButtons,
    leftBuildingMenu,
    compareButton,
    SearchIcon,
    CloseIcon
  },
  computed: {
    filteredBuildings () {
      return this.$store.getters['map/buildings'].filter(building => building.geoJSON)
    },
    mapLoaded () {
      return (
        this.filteredBuildings.length > 0 && // buildings are loaded
        this.processedLayers === this.filteredBuildings.length && // all layers are processed
        !this.$store.getters['map/buildingMap'].size // all geojson layers are loaded
      )
    },
    showSide: {
      get () {
        return this.$store.getters['modalController/modalName'] === 'map_side_view'
      },

      set (value) {
        this.$store.dispatch('modalController/closeModal')
      }
    },
    showCompareSide: {
      get () {
        return this.$store.getters['modalController/modalName'] === 'map_compare_side'
      },

      set (value) {
        this.$store.dispatch('modalController/closeModal')
      }
    }
  },
  data () {
    return {
      selectedOption: 'All',
      searchGroup: [],
      search: '',
      zoom: DEFAULT_ZOOM,
      center: L.latLng(DEFAULT_LAT, DEFAULT_LON),
      url: 'https://api.mapbox.com/styles/v1/jack-woods/cjmi2qpp13u4o2spgb66d07ci/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFjay13b29kcyIsImEiOiJjamg2aWpjMnYwMjF0Mnd0ZmFkaWs0YzN0In0.qyiDXCvvSj3O4XvPsSiBkA',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      map: null,
      polygonData: null,
      openBuilding: 0,
      compareStories: [],
      grouping: 'Category',
      ele: [],
      compareMarkers: [],
      rKey: 1,
      message: this.message,
      askingForComparison: false,
      building_compare_error: false,
      selected: [
        'Academics',
        'Events & Engagement',
        'Admin & Operations',
        'Residential Life',
        'Stable Trend',
        'Up Trend',
        'Down Trend'
      ],
      show: false,
      processedLayers: 0,
      buildingOptions: {
        onEachFeature: (feature, layer) => {
          this.processedLayers++
          layer.on('click', e => {
            this.building_compare_error = false
            this.polyClick(e.target.feature.properties.id, e.target.feature, layer.getBounds().getCenter())
          })
          layer.on('mouseover', e => {
            if (!e.target.setStyle) return
            e.target.oldStyle = {
              fillColor: e.target.options.fillColor,
              color: e.target.options.color
            }
            e.target.setStyle({ fillColor: '#000', color: '#000' })
            e.target.bindTooltip(e.target.feature.properties.name).openTooltip()
          })
          layer.on('mouseout', e => {
            if (!e.target.setStyle) return
            e.target.setStyle({ ...e.target.oldStyle })
          })
          const color = this.getCategoryColor(feature.properties.group)
          layer.setStyle({ fillColor: color, color: color, opacity: 1, fillOpacity: 0.7, weight: 2 })
        }
      }
    }
  },
  methods: {
    polyClick: function (id, feature, center) {
      if (!this.askingForComparison) {
        this.$store.dispatch('modalController/openModal', {
          name: 'map_side_view',
          id: id
        })
      } else {
        if (this.askingForComparison && this.compareStories.indexOf(id) < 0) {
          const data =
            "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><circle cx='256' cy='256' r='246' fill='#D73F09' stroke='#FFF' stroke-width='20'/><path transform='scale(0.7 0.7) translate(76.8 86.8)' fill='#FFF' d='M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z'></path></svg>"
          const formed = encodeURI('data:image/svg+xml,' + data).replace(/#/g, '%23')
          const checkIcon = L.icon({
            iconUrl: formed,
            iconSize: [20, 20],
            shadowUrl: ''
          })
          const marker = L.marker(center, {
            icon: checkIcon,
            bubblingMouseEvents: true,
            interactive: false
          }).addTo(this.map)
          marker.buildingId = id
          this.compareMarkers.push(marker)
          this.compareStories.push(id)
        } else if (this.askingForComparison) {
          const removingMarkerIndex = this.compareMarkers.findIndex(e => e.buildingId === id)
          if (removingMarkerIndex === -1) {
            return
          }
          const marker = this.compareMarkers.splice(removingMarkerIndex, 1)[0]
          this.map.removeLayer(marker)
          this.compareStories.splice(this.compareStories.indexOf(id), 1)
        }
      }
    },
    resetMap () {
      this.map.setView(L.latLng(DEFAULT_LAT, DEFAULT_LON), DEFAULT_ZOOM)
      for (let layer of Object.values(this.map._layers)) {
        layer.unbindTooltip()
      }
    },
    getResult (searchResult) {
      for (let layer of Object.values(this.map._layers)) {
        layer.unbindTooltip()
      }
      let searchLatLng = searchResult.getBounds().getCenter()
      searchLatLng.lng = searchLatLng.lng - 0.003
      this.map.setView(L.latLng(searchLatLng), DEFAULT_ZOOM)
      searchResult
        .bindTooltip(searchResult.feature.properties.name, { permanent: true, fillColor: '#000', color: '#000' })
        .openTooltip()

      if (this.askingForComparison && this.compareStories.indexOf(searchResult.feature.properties.id) < 0) {
        const data =
          "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><circle cx='256' cy='256' r='246' fill='#D73F09' stroke='#FFF' stroke-width='20'/><path transform='scale(0.7 0.7) translate(76.8 86.8)' fill='#FFF' d='M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z'></path></svg>"
        const formed = encodeURI('data:image/svg+xml,' + data).replace(/#/g, '%23')
        let searchCenter = searchResult.getBounds().getCenter()
        const checkIcon = L.icon({
          iconUrl: formed,
          iconSize: [20, 20],
          shadowUrl: ''
        })
        const marker = L.marker(searchCenter, {
          icon: checkIcon,
          bubblingMouseEvents: true,
          interactive: false
        }).addTo(this.map)
        marker.buildingId = searchResult.feature.properties.id
        this.compareMarkers.push(marker)
        this.compareStories.push(searchResult.feature.properties.id)
      } else if (this.askingForComparison) {
        const removingMarkerIndex = this.compareMarkers.findIndex(
          e => e.buildingId === searchResult.feature.properties.id
        )
        if (removingMarkerIndex === -1) {
          return
        }
        const marker = this.compareMarkers.splice(removingMarkerIndex, 1)[0]
        this.map.removeLayer(marker)
        this.compareStories.splice(this.compareStories.indexOf(searchResult.feature.properties.id), 1)
      }
    },
    resetSearchInput () {
      this.search = ''
      for (let layer of Object.values(this.map._layers)) {
        layer.unbindTooltip()
      }
    },
    removeAllMarkers: function () {
      for (let marker of this.compareMarkers) {
        this.map.removeLayer(marker)
      }
      this.compareMarkers = []
    },
    showComparison: async function (target) {
      this.askingForComparison = false
      this.removeAllMarkers()
      if (this.compareStories[0] === undefined) {
        this.compareStories.shift()
        if (this.compareStories[0] === undefined) {
          this.showSide = false
          this.building_compare_error = true
        }
      }

      try {
        if (this.building_compare_error === false) {
          let path = this.$store.getters['map/building'](this.compareStories[0]).path
          if (target !== 'q' && this.compareStories.length === 1) {
            this.$router.push({
              path: `/compare/${encodeURI(JSON.stringify(this.compareStories))}/2`
            })
          }
          let mgId = this.$store.getters[path + '/primaryGroup']('Electricity').id
          let blockSpace = this.$store.getters[path + '/block'](mgId).path
          await this.$store.dispatch(blockSpace + '/removeAllModifiers')
          await this.$store.dispatch(blockSpace + '/addModifier', 'building_compare')
          await this.$store.dispatch(blockSpace + '/updateModifier', {
            name: 'building_compare',
            data: {
              buildingIds: this.compareStories
            }
          })

          if (target === 'q') {
            this.$store.dispatch('modalController/openModal', {
              name: 'map_compare_side',
              path: path
            })
          } else if (target !== 'q' && this.compareStories.length > 1) {
            this.$router.push({
              path: `/compare/${encodeURI(JSON.stringify(this.compareStories))}/2`
            })
          }
        }
      } catch (err) {
        // uncomment this to see exact errors in debug
        // console.error(err)
        this.showSide = false
        this.building_compare_error = true
        this.compareStories.shift()
      }
    },
    startCompare: function (buildingId) {
      this.building_compare_error = false
      this.showSide = false
      this.askingForComparison = true
      this.compareStories = []
      if (buildingId !== undefined) {
        this.compareStories.push(buildingId)
      }

      const data =
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><circle cx='256' cy='256' r='246' fill='#D73F09' stroke='#FFF' stroke-width='20'/> <path transform='scale(0.7 0.7) translate(76.8 86.8)' fill='#FFF' d='M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z'></path></svg>"
      const formed = encodeURI('data:image/svg+xml,' + data).replace(/#/g, '%23')
      const checkIcon = L.icon({
        iconUrl: formed,
        iconSize: [20, 20],
        shadowUrl: ''
      })
      let center = null
      for (let layer of Object.values(this.map._layers)) {
        if (
          layer.feature &&
          layer.feature.geometry &&
          layer.feature.geometry.type === 'Polygon' &&
          layer.feature.properties.id === buildingId
        ) {
          center = layer.getBounds().getCenter()
        }
      }
      if (!center) {
        return
      }
      const marker = L.marker(center, {
        icon: checkIcon,
        bubblingMouseEvents: true,
        interactive: false
      }).addTo(this.map)
      marker.buildingId = buildingId
      this.compareMarkers.push(marker)
    },
    stopCompare: function () {
      this.askingForComparison = false
      this.showSide = true
      this.compareStories = []
      this.removeAllMarkers()
    },
    stopCompareError: function () {
      this.building_compare_error = false
      this.showSide = true
      this.askingForComparison = true
      this.compareStories = []
      this.removeAllMarkers()
    },
    isDisplayed: function (v) {
      return this.selected.includes(v)
    },
    handleSelect: function (string) {
      this.processedLayers = 0 // reset processed layers
      if (this.selected.includes(string)) {
        this.selected = this.selected.filter(item => item !== string)
      } else {
        this.selected = [...this.selected, string]
      }
    },
    computedColor: function (percentage) {
      // #d62326 - Bottom Red
      // #19a23a - Top Green
      const redInt = [parseInt('0xd6', 16), parseInt('0x23', 16), parseInt('0x26', 16)]
      const greenInt = [parseInt('0x19', 16), parseInt('0xa2', 16), parseInt('0x3a', 16)]
      const typicalColor = [redInt[0] - greenInt[0], greenInt[1] - redInt[1], greenInt[2] - redInt[2]]
      const compare = Math.abs(percentage) / 0.01
      const result = []
      if (percentage < -0.01) {
        result.push(greenInt[0])
        result.push(greenInt[1])
        result.push(greenInt[2])
      } else if (percentage > 0.01) {
        result.push(redInt[0])
        result.push(redInt[1])
        result.push(redInt[2])
      } else if (percentage < 0) {
        result.push(Math.round(typicalColor[0] - redInt[0] * compare))
        result.push(Math.round(typicalColor[1] + redInt[1] * compare))
        result.push(Math.round(typicalColor[2] + redInt[2] * compare))
      } else {
        result.push(Math.round(typicalColor[0] + greenInt[0] * compare))
        result.push(Math.round(typicalColor[1] - greenInt[1] * compare))
        result.push(Math.round(typicalColor[2] - greenInt[2] * compare))
      }
      return 'rgb(' + result[0].toString() + ',' + result[1].toString() + ',' + result[2].toString() + ')'
    },
    getCategoryColor: function (group) {
      switch (group) {
        case 'Academics':
          return '#0D5257'
        case 'Events & Engagement':
          return '#7A6855'
        case 'Admin & Operations':
          return '#4169E1'
        case 'Residential Life':
          return '#D3832B'
        default:
          return '#000'
      }
    },
    updateLayerCategoryStyle (layer) {
      const color = this.getCategoryColor(layer.feature.properties.group)
      layer.setStyle({ fillColor: color, color: color })
    },
    async updateEnergySlopeColor (layer) {
      try {
        // Retrieves building object from store using leaflet property id
        await this.$store.getters['map/promise']
        const building = this.$store.getters['map/building'](layer.feature.properties.id)
        await this.$store.getters[building.path + '/promise']

        // Retrieves primary energy group from store
        const mg = this.$store.getters[building.path + '/primaryGroup']('Electricity')
        const defaultBlock = this.$store.getters[building.path + '/block'](mg.id)
        await this.$store.getters[defaultBlock.path + '/promise']
        const defaultChart = this.$store.getters[defaultBlock.path + '/charts'][0]

        // Gets current date and date 60 days ago
        const currentDate = new Date()
        const minus60 = new Date(currentDate.getTime() - 60 * 24 * 60 * 60 * 1000)
        const reqPayload = {
          dateEnd: Math.floor(currentDate.getTime() / 1000),
          dateStart: Math.floor(minus60.getTime() / 1000),
          intervalUnit: 'day',
          dateInterval: 1,
          graphType: 1
        }
        const data = await this.$store.dispatch(defaultChart.path + '/getData', reqPayload)

        // Compute slope (least squares algorithm)
        const series = data.data
        let meanY = series.reduce((acc, cur) => acc + cur.y, 0) / series.length
        let meanX = series.length / 2 // No need to use date can just use index
        let accmxx = 0
        let accmxxyy = 0
        series.forEach((point, idx) => {
          accmxx += (idx - meanX) * (idx - meanX)
          accmxxyy += (point.y - meanY) * (idx - meanX)
        })
        const slope = accmxxyy / accmxx
        const normalizedSlope = slope / meanY

        // Convert slope to color
        const color = this.computedColor(normalizedSlope)
        layer.setStyle({ fillColor: color, color: color })
      } catch (err) {
        layer.setStyle({ fillColor: '#000', color: '#000' })
      }
    },
    updateMapRef () {
      this.map = this.$refs.map.leafletObject
      this.map.zoomControl.setPosition('topleft')
    }
  },
  async created () {
    this.message = window.innerWidth > 844

    // Event listener for input data
    this.handleInputData = inputWord => {
      this.message = inputWord
    }
    emitter.on('inputData', this.handleInputData)
  },
  mounted () {
    this.$nextTick(() => {
      this.map = this.$refs.map.leafletObject
    })
  },
  beforeUnmount () {
    emitter.off('inputData', this.handleInputData)
  },
  watch: {
    selectedOption (energyFilter) {
      this.processedLayers = 0
      this.rKey++
      this.$nextTick(() => {
        this.map = this.$refs.map.leafletObject
        for (var layerKey of Object.keys(this.map._layers)) {
          let layer = this.map._layers[layerKey]
          if (layer.feature && energyFilter !== 'All') {
            let descArray = this.$store.getters['map/building'](layer.feature.properties.id).description.split(', ')
            let descLength = 0
            for (let i = 0; i < descArray.length; i++) {
              if (energyFilter.includes(descArray[i])) {
                descLength += 1
              }
            }
            if (descLength === 0) {
              this.map.removeLayer(layer)
            }
          }
        }
      })
    },
    grouping: {
      async handler () {
        this.search = ''
        this.rKey++
        await this.$nextTick()
        let promises = []
        this.$refs.geoLayer.forEach(geoJsonComponent => {
          const geoJsonLayer = geoJsonComponent.leafletObject
          geoJsonLayer.eachLayer(async layer => {
            if (this.grouping === 'Category') {
              this.updateLayerCategoryStyle(layer)
            } else if (this.grouping === 'Energy Trend') {
              promises.push(this.updateEnergySlopeColor(layer))
            }
          })
        })
        await Promise.all(promises)
        this.processedLayers = this.filteredBuildings.length
      }
    },
    search: function (v) {
      if (v === '') {
        this.searchGroup = []
        return
      }
      var searchGroup = []
      for (let layer of Object.values(this.map._layers)) {
        if (layer.feature && layer.feature.geometry && layer.feature.geometry.type === 'Polygon') {
          if (layer.feature.properties.name !== undefined) {
            if (layer.feature.properties.name.toLowerCase().includes(v.toLowerCase())) {
              searchGroup.push(layer)
            }
          }
        }
      }
      this.searchGroup = searchGroup
    },
    selected: function (val) {
      this.rKey++
      this.$nextTick(() => {
        this.map = this.$refs.map.leafletObject
        for (var layerKey of Object.keys(this.map._layers)) {
          let layer = this.map._layers[layerKey]
          if (layer.feature) {
            if (!val.includes(layer.feature.properties.group) && this.grouping === 'Category') {
              this.map.removeLayer(layer)
            }
          }
        }
      })
    }
  }
}
</script>

<style>
@import '../../../node_modules/leaflet/dist/leaflet.css';
</style>
<style scoped lang="scss">
$sideMenu-width: 250px;
.colorByTitle {
  color: $color-white;
  font-size: 26px;
  text-align: center;
  font-family: 'stratumno2';
}
.energyRadioButtons {
  margin-left: 20px;
  margin-top: 10px;
}
.energyRadioGroup {
  margin-top: 10px;
}
.el-radio {
  color: white;
  height: 0px;
}
.stage {
  padding: 0;
  position: absolute;
  width: 100%;
  height: 100%;
}

.el-menu-item {
  height: 40px;
  line-height: 40px;
  position: static;
}

.sideMenu {
  background-color: $color-black;
  position: absolute;
  z-index: 2000;
  width: $sideMenu-width - 10px;
  padding-top: 0.5em;
  top: 175px;
}

:deep(.el-menu-item-group__title) {
  margin-top: -35px;
}

.el-menu-item-group {
  margin-top: 45px;
  margin-bottom: 15px;
}

.sideMenuGroupTitle {
  font-size: 18px;
  color: #ffffff;
  font-weight: bolder;
}
.mapContainer {
  position: absolute;
  top: 0;
  left: 0px;
  height: 100%;
  width: calc(100%);
}

.hideMenuButton {
  display: flex;
  position: absolute;
  top: 125px;
  left: 10px;
}
.side-enter-active,
.side-leave-active {
  transition: all 1s;
}
.side-enter-from {
  opacity: 0;
  transform: translateX(300px);
}
.side-enter-to {
  opacity: 1;
  transform: translateX(0px);
}
.side-leave-from {
  opacity: 1;
  transform: translateY(0px);
}
.side-leave-to {
  opacity: 0;
  transform: translateY(500px);
}
.swatch {
  width: 20px;
  height: 10px;
  background-color: #000;
  display: inline-block;
  margin-right: 0.5em;
  border: solid 2px #000;
}
.notactive {
  color: #ffffff66 !important;
}
.active {
  color: #ffffff !important;
}
.notactive .swatch {
  background-color: #ffffff22;
  border-color: #ffffff44;
}
.active .residential.swatch {
  background-color: #d3832bb3;
  border-color: #d3832b;
}
.active .academics.swatch {
  background-color: #0d5257b3;
  border-color: #0d5257;
}
.active .events_engagement.swatch {
  background-color: #7a6855b3;
  border-color: #7a6855;
}
.active .admin_operations.swatch {
  background-color: #4169e1;
  border-color: #00008b;
}
.label {
  color: #000;
  font-size: 1em;
}
.active .stable.swatch {
  background-color: #ffb500b3;
  border-color: #ffb500;
}
.active .down.swatch {
  background-color: #4a773cb3;
  border-color: #4a773c;
}
.active .up.swatch {
  background-color: #d62326b3;
  border-color: #d62326;
}
.trendGradient {
  width: 20px;
  height: 150px;
  border: solid 2px rgb(255, 255, 255);
  background: rgb(25, 162, 58);
  background: linear-gradient(180deg, rgba(25, 162, 58, 1) 0%, rgba(214, 35, 38, 1) 100%);
  border-radius: 8px;
}
.trendBox {
  padding: 20px;
  position: relative;
  font-size: 16px;
  color: #fff;
}
.trendTopLabel {
  position: absolute;
  left: 60px;
  top: 20px;
}
.trendBottomLabel {
  position: absolute;
  left: 60px;
  bottom: 20px;
}
.resetMapButton {
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  display: flex;
  align-items: center;
  position: absolute;
  top: 10px;
  left: 50px;
  width: 110px;
  height: 63px;
  background-color: white;
  border: 2px solid rgba(0, 0, 0, 0.2);
  background-clip: padding-box;
  border-radius: 4.5px;
  opacity: 1;
  justify-content: center;
  z-index: 500;
  cursor: pointer;
  font-size: 15px;
}
.searchMapInput {
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  display: flex;
  align-items: center;
  position: absolute;
  top: 45px;
  left: 10px;
  width: 225px;
  height: 40px;
  background-color: white;
  border: 2px solid rgba(0, 0, 0, 0.2);
  background-clip: padding-box;
  border-radius: 4.5px;
  opacity: 1;
  justify-content: center;
  z-index: 500;
}
:deep(.el-input__wrapper) {
  padding: 5px;
}
.searchIcon,
.closeIcon {
  cursor: pointer;
  color: #d73f09;
}
.closeIcon {
  font-size: 28px;
}
.searchMapResult {
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  align-items: center;
  padding-left: 10px;
  position: relative;
  top: 40px;
  left: 10px;
  width: 210px;
  white-space: nowrap;
  overflow: hidden;
  height: 25px;
  background-color: white;
  border: 2px solid rgba(0, 0, 0, 0.2);
  background-clip: padding-box;
  border-radius: 4.5px;
  opacity: 1;
  justify-content: center;
  z-index: 500;
  cursor: pointer;
  font-size: 16px;
  margin-bottom: -18px;
  line-height: 1.8;
}
.searchMapResult:first-child {
  margin-top: 10px;
}
.searchMapResult:hover {
  background-color: #fafa33;
}
.longBuildingName {
  position: absolute;
  white-space: nowrap;
  transform: translateX(0);
  transition: 1.5s;
}
.longBuildingName:hover {
  transform: translateX(calc(200px - 100%));
}
.searchResultDiv {
  margin-top: 10px;
  margin-bottom: 0px;
}
@media only screen and (max-width: 600px) {
  .hideMenuButton {
    left: 0px;
  }
  .searchResultDiv {
    margin-top: 15px;
  }
}
</style>
