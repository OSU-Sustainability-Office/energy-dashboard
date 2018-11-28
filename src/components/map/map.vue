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
          <el-menu-item index='Admin' :class="[(isDisplayed('Admin') ? 'active' : 'notactive')]"><span class='com swatch'></span>Events & Admin</el-menu-item>
          <el-menu-item index='Residence' :class="[(isDisplayed('Residence') ? 'active' : 'notactive')]"><span class='res swatch'></span>Residence</el-menu-item>
        </el-menu-item-group>
      </el-menu>
      <div class='mapContainer' ref='mapContainer'>
        <l-map style="height: 100%; width: 100%;" :zoom="zoom" :center="center" ref='map'>
          <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
          <l-geo-json :key='rKey' :geojson='this.polygonData' :options='buildingOptions' ref="geoLayer"></l-geo-json>
        </l-map>
      </div>
      <transition name='side'>
        <sideView :key='openStory' :storyId='openStory' ref='sideview' v-if='showSide' @hide='showSide = false'></sideView>
      </transition>
    </el-col>
  </el-row>
</template>
<script>
import { LMap, LTileLayer, LMarker, LPolygon, LGeoJson } from 'vue2-leaflet'
import sideView from '@/components/map/sideView'
import L from 'leaflet'

export default {
  name: 'featured',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPolygon,
    sideView,
    LGeoJson
  },
  data () {
    return {
      zoom: 15.5,
      center: L.latLng(44.565, -123.2785),
      url: 'https://api.mapbox.com/styles/v1/jack-woods/cjmi2qpp13u4o2spgb66d07ci/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFjay13b29kcyIsImEiOiJjamg2aWpjMnYwMjF0Mnd0ZmFkaWs0YzN0In0.qyiDXCvvSj3O4XvPsSiBkA',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      map: null,
      polygonData: null,
      openStory: 0,
      showSide: false,
      ele: [],
      rKey: 0,
      selected: ['Residence', 'Athletics', 'Dining', 'Academics', 'Admin'],
      show: false,
      buildingOptions: {
        onEachFeature: function (feature, layer) {
          layer.on('click', function (e) { window.vue.$eventHub.$emit('clickedPolygon', [feature.properties.story_id]) })
          layer.on('mouseover', function (e) {
            e.target.setStyle({ fillColor: '#000', color: '#000' })
            e.target.bindTooltip(e.target.feature.properties.name).openTooltip()
          })
          layer.on('mouseout', e => { window.vue.$eventHub.$emit('resetPolygon', [e.target]) })
        },
        style: function (feature) {
          var color = '#000'
          switch (feature.properties.affiliation) {
            case 'Residence':
              color = '#D3832B'
              break
            case 'Academics':
              color = '#0D5257'
              break
            case 'Admin':
              color = '#7A6855'
              break
            case 'Athletics':
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
    polyClick: function (value) {
      this.openStory = value
      this.$nextTick(() => {
        this.showSide = true
      })
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
    this.$store.dispatch('mapdata').then(r => {
      this.polygonData = r
    })
    this.$eventHub.$on('clickedPolygon', v => (this.polyClick(v[0])))
    this.$eventHub.$on('resetPolygon', v => { this.$refs.geoLayer.mapObject.resetStyle(v[0]) })
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
    this.$eventHub.$off('clickedPolygon')
    this.$eventHub.$off('resetPolygon')
  },
  watch: {
    selected: function (val) {
      this.rKey++
      //  L.geoJSON(this.polygonData).addTo(this.map);
      this.$nextTick(() => {
        for (var layerKey of Object.keys(this.map._layers)) {
          var layer = this.map._layers[layerKey]
          if (layer.feature) {
            if (!val.includes(layer.feature.properties.affiliation)) {
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
@import '@/assets/style-variables.scss';
$sideMenu-width: 250px;
.main {

}
.stage {
  padding: 0;
  position: absolute;
  width: 100%;
  height: calc(100vh - #{$--nav-height});
}
.sideMenu {
  background-color: $--color-black;
  height: 100%;
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
