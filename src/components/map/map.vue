<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-01-03T12:39:57-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-05-01T18:35:17-07:00
-->

<template>
  <el-row class='stage'>
    <el-col :span='24'>
      <el-menu class='sideMenu' mode='vertical' backgroundColor='#1A1A1A' @select='handleSelect'>
        <el-menu-item-group>
          <span slot='title' class='sideMenuGroupTitle'>Key</span>
          <el-tooltip content="Click to toggle visibility" placement="right">
            <el-menu-item index='Academics' :class="[(isDisplayed('Academics') ? 'active' : 'notactive')]"><span class='edu swatch'></span>Academics</el-menu-item>
          </el-tooltip>
          <el-menu-item index='Athletics' :class="[(isDisplayed('Athletics') ? 'active' : 'notactive')]"><span class='ath swatch'></span>Athletics & Rec</el-menu-item>
          <el-menu-item index='Dining' :class="[(isDisplayed('Dining') ? 'active' : 'notactive')]"><span class='din swatch'></span>Dining</el-menu-item>
          <el-menu-item index='Events & Admin' :class="[(isDisplayed('Events & Admin') ? 'active' : 'notactive')]"><span class='com swatch'></span>Events & Admin</el-menu-item>
          <el-menu-item index='Residence' :class="[(isDisplayed('Residence') ? 'active' : 'notactive')]"><span class='res swatch'></span>Residence</el-menu-item>
        </el-menu-item-group>
      </el-menu>
      <div class='mapContainer' ref='mapContainer' v-loading='!mapLoaded'>
        <l-map style="height: 100%; width: 100%;" :zoom="zoom" :center="center" ref='map'>
          <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
          <l-geo-json v-for='building of this.$store.getters["map/buildings"]' :key='building.id * rKey' :geojson='building.geoJSON' :options='buildingOptions' ref="geoLayer"></l-geo-json>
        </l-map>
      </div>
      <prompt v-if='askingForComparison' @cancel='stopCompare' @compare='showComparison' />
      <transition name='side'>
        <compareSide v-if='showCompareSide' @hide='showCompareSide = false' :compareStories='compareStories' />
        <sideView ref='sideview' v-if='showSide' @hide='showSide = false' @startCompare='startCompare()'></sideView>
      </transition>
    </el-col>
  </el-row>
</template>
<script>
import { LMap, LTileLayer, LGeoJson } from 'vue2-leaflet'
import sideView from '@/components/map/sideView'
import prompt from '@/components/map/map_prompt'
import compareSide from '@/components/map/map_compareside'
import L from 'leaflet'

export default {
  name: 'featured',
  components: {
    LMap,
    LTileLayer,
    sideView,
    LGeoJson,
    prompt,
    compareSide
  },
  computed: {
    showSide: {
      get () {
        return (this.$store.getters['modalController/modalName'] === 'map_side_view')
      },

      set (value) {
        this.$store.dispatch('modalController/closeModal')
      }
    }
  },
  data () {
    return {
      zoom: 15.5,
      center: L.latLng(44.565, -123.2785),
      url: 'https://api.mapbox.com/styles/v1/jack-woods/cjmi2qpp13u4o2spgb66d07ci/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFjay13b29kcyIsImEiOiJjamg2aWpjMnYwMjF0Mnd0ZmFkaWs0YzN0In0.qyiDXCvvSj3O4XvPsSiBkA',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      map: null,
      polygonData: null,
      openBuilding: 0,
      compareStories: [],
      showCompareSide: 0,
      ele: [],
      compareMarkers: [],
      rKey: 1,
      askingForComparison: false,
      selected: ['Residence', 'Athletics', 'Dining', 'Academics', 'Events & Admin'],
      show: false,
      mapLoaded: false,
      buildingOptions: {
        onEachFeature: (feature, layer) => {
          layer.on('click', e => {
            // window.vue.$store.dispatch('modalController/closeModal').then(() => {
            window.vue.$store.dispatch('modalController/openModal', {
              name: 'map_side_view',
              id: e.target.feature.properties.id
            })
            // })
          })
          layer.on('mouseover', function (e) {
            console.log(e.target)
            e.target.oldStyle = { fillColor: e.target.options.fillColor, color: e.target.options.color }
            e.target.setStyle({ fillColor: '#000', color: '#000' })
            e.target.bindTooltip(e.target.feature.properties.name).openTooltip()
          })
          layer.on('mouseout', e => { e.target.style = e.target.setStyle({ ...e.target.oldStyle }) })
        },
        style: feature => {
          var color = '#000'
          switch (feature.properties.group) {
            case 'Residence':
              color = '#D3832B'
              break
            case 'Academics':
              color = '#0D5257'
              break
            case 'Events & Admin':
              color = '#7A6855'
              break
            case 'Athletics & Rec':
              color = '#FFB500'
              break
            case 'Dining':
              color = '#4A773C'
              break
            default:
              break
          }
          return {
            weight: 2,
            color: color,
            opacity: 1,
            fillColor: color,
            fillOpacity: 0.7
          }
        }
      }
    }
  },
  methods: {
    polyClick: function (id, feature, center) {
      if (!this.askingForComparison) {
        this.openBuilding = id
        this.$nextTick(() => {
          this.showSide = true
        })
      } else {
        if (this.askingForComparison && this.compareStories.indexOf(id) < 0) {
          const data = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><circle cx='256' cy='256' r='246' fill='#D73F09' stroke='#FFF' stroke-width='20'/><path transform='scale(0.7 0.7) translate(76.8 86.8)' fill='#FFF' d='M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z'></path></svg>"
          const formed = encodeURI('data:image/svg+xml,' + data).replace(/#/g, '%23')
          const checkIcon = L.icon({
            iconUrl: formed,
            iconSize: [20, 20],
            shadowUrl: ''
          })
          const marker = L.marker(center, { icon: checkIcon, bubblingMouseEvents: true, interactive: false }).addTo(this.map)
          marker.storyId = feature.properties.story_id
          this.compareMarkers.push(marker)
          this.compareStories.push(id)
        } else if (this.askingForComparison) {
          const removingMarkerIndex = this.compareMarkers.findIndex(e => e.storyId === feature.properties.story_id)
          if (removingMarkerIndex === -1) {
            return
          }
          const marker = this.compareMarkers.splice(removingMarkerIndex, 1)[0]
          this.map.removeLayer(marker)
          this.compareStories.splice(this.compareStories.indexOf(id), 1)
        }
      }
    },
    removeAllMarkers: function () {
      for (let marker of this.compareMarkers) {
        this.map.removeLayer(marker)
      }
    },
    showComparison: function (target) {
      this.askingForComparison = false
      this.removeAllMarkers()
      if (target === 'q') {
        this.showCompareSide = true
      } else {
        this.$router.push({ path: `/compare/${encodeURI(JSON.stringify(this.compareStories))}/1` })
      }
    },
    startCompare: function () {
      this.showSide = false
      this.askingForComparison = true
      this.compareStories = []
      this.compareStories.push(this.openStory)

      const data = "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><circle cx='256' cy='256' r='246' fill='#D73F09' stroke='#FFF' stroke-width='20'/> <path transform='scale(0.7 0.7) translate(76.8 86.8)' fill='#FFF' d='M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z'></path></svg>"
      const formed = encodeURI('data:image/svg+xml,' + data).replace(/#/g, '%23')
      const checkIcon = L.icon({
        iconUrl: formed,
        iconSize: [20, 20],
        shadowUrl: ''
      })
      let center = null
      for (let layer of Object.values(this.map._layers)) {
        if (layer.feature && layer.feature.properties.story_id === this.openStory) {
          center = layer.getBounds().getCenter()
        }
      }
      if (!center) {
        return
      }
      const marker = L.marker(center, { icon: checkIcon, bubblingMouseEvents: true, interactive: false }).addTo(this.map)
      marker.storyId = this.openStory
      this.compareMarkers.push(marker)
    },
    stopCompare: function () {
      this.askingForComparison = false
      this.showSide = true
      this.compareStories = []
      this.removeAllMarkers()
    },
    isDisplayed: function (v) {
      if (this.selected.indexOf(v) >= 0) {
        return true
      } else {
        return false
      }
    },
    handleSelect: function (string) {
      if (this.selected.indexOf(string) >= 0) {
        this.selected.splice(this.selected.indexOf(string), 1)
      } else {
        this.selected.push(string)
      }
    }
  },
  created () {
    this.$store.getters['map/promise'].then(() => {
      this.mapLoaded = true
    })
    // this.$eventHub.$on('clickedPolygon', v => (this.polyClick(v[0], v[2], v[1])))
    // this.$eventHub.$on('resetPolygon', v => { this.$refs.geoLayer.forEach(e => { e.mapObject.resetStyle(v[0]) }) })
  },
  mounted () {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject
      // this.$refs.mapContainer.style.height = (window.innerHeight - 80 - this.$refs.topBar.clientHeight).toString() + 'px'
      // window.addEventListener('resize', () => {
      //   this.$refs.mapContainer.style.height = (window.innerHeight - 80 - this.$refs.topBar.clientHeight).toString() + 'px'
      // })
    })
  },
  beforeDestroy () {
    // this.$eventHub.$off('clickedPolygon')
    // this.$eventHub.$off('resetPolygon')
  },
  watch: {
    selected: function (val) {
      this.rKey++
      this.$nextTick(() => {
        this.map = this.$refs.map.mapObject
        for (var layerKey of Object.keys(this.map._layers)) {
          let layer = this.map._layers[layerKey]
          if (layer.feature) {
            if (!val.includes(layer.feature.properties.group)) {
              this.map.removeLayer(layer)
            }
          }
        }
      })
    }
  }
}
</script>

<style >
@import "../../../node_modules/leaflet/dist/leaflet.css";
</style>
<style scoped lang='scss'>
$sideMenu-width: 250px;
.stage {
  padding: 0;
  position: absolute;
  width: 100%;
  height: calc(100vh - #{$--nav-height});
}
.sideMenu {
  background-color: $--color-black;
  height: calc(100% - 1em);
  position: absolute;
  top: 0;
  left: 0;
  z-index: 20000;
  width: $sideMenu-width;
  padding-top: 1em;
}
.sideMenuGroupTitle {
  font-size: 18px;
  color: #ffffff;
  font-weight: bolder;
}
.mapContainer {
  background-color: blue;
  position: absolute;
  top: 0;
  left: 250px;
  height: 100%;
  width: calc(100% - #{$sideMenu-width});
}

.side-enter-active, .side-leave-active {
  transition: all 1s;
}
.side-enter {
  opacity: 0;
  transform: translateX(300px);
}
.side-enter-to {
  opacity: 1;
  transform: translateX(0px);
}
.side-leave {
  opacity: 1;
  transform: translateY(0px);
}
.side-leave-to /* .fade-leave-active below version 2.1.8 */ {
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
  color: #FFFFFF66 !important;
}
.active {
  color: #FFFFFF !important;
}
.notactive .swatch {
  background-color: #FFFFFF22;
  border-color: #FFFFFF44;
}
.active .res.swatch {
  background-color: #D3832BB3;
  border-color: #D3832B;
}
.active .ath.swatch {
  background-color: #FFB500B3;
  border-color: #FFB500;
}
.active .din.swatch {
  background-color: #4A773CB3;
  border-color: #4A773C;
}
.active .rch.swatch {
  background-color: #AA9D2EB3;
  border-color: #AA9D2E;
}
.active .edu.swatch {
  background-color: #0D5257B3;
  border-color: #0D5257;
}
.active .com.swatch {
  background-color: #7A6855B3;
  border-color: #7A6855;
}
.label {
  color: #000;
  font-size: 1em;
}
</style>
