<template>
  <div class="main">
    <div class='topBar container-fluid'>
      <div class='row'>

        <div class='key col'>
          <div class='row'>
            <div class='keyEl label font-weight-bold'>Key</div>
            <div class='keyEl'><div class='edu swatch'></div>Academics</div>
            <div class='keyEl'><div class='ath swatch'></div>Athletics & Rec</div>
            <div class='keyEl'><div class='din swatch'></div>Dining</div>
            <div class='keyEl'><div class='com swatch'></div>Events & Admin</div>
            <div class='keyEl'><div class='res swatch'></div>Residence</div>
          </div>
        </div>
        <div class='fil col-4'>
          <b-dropdown class='d-inline-block' toggle-class='mapFilterBtn' menu-class='dropdownArea' text='Filter' ref='mapFilter'>
            <b-dropdown-item disabled>
              <div class='container'>
                <div class='row text-center'>
                  <div class='col label font-weight-bold'>Building Type</div>
                </div>
                <div class='row'>
                  <div class='col-6'>
                    <div class='row'>
                      <div class='col'>
                        <input type="checkbox" value='Residence' v-model="selected" checked> Residence
                      </div>
                    </div>
                    <div class='row'>
                      <div class='col'>
                        <input type="checkbox" value='Dining' v-model="selected" checked> Dining
                      </div>
                    </div>
                    <div class='row'>
                      <div class='col'>
                        <input type="checkbox" value='Athletics' v-model="selected" checked> Athletics & Rec
                      </div>
                    </div>
                  </div>
                  <div class='col-6'>
                    <div class='row'>
                      <div class='col'>
                        <input type="checkbox" value='Research' v-model="selected" checked> Research
                      </div>
                    </div>
                    <div class='row'>
                      <div class='col'>
                        <input type="checkbox" value='Education' v-model="selected" checked> Education
                      </div>
                    </div>
                    <div class='row'>
                      <div class='col'>
                        <input type="checkbox" value='Common' v-model="selected" checked> Common
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </b-dropdown-item>
          </b-dropdown>
        </div>
      </div>
    </div>
    <transition name='side'>
      <sideView v-bind:key='openStory' ref='sideview' v-if='showSide'></sideView>
    </transition>
    <l-map style="height: calc(100% - 50px); position:absolute;top: 50px;" :zoom="zoom" :center="center" ref='map'>
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <l-geo-json :key='rKey' :geojson='this.polygonData' :options='buildingOptions' ref="geoLayer"></l-geo-json>
    </l-map>

  </div>
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
      url: 'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      map: null,
      polygonData: null,
      openStory: 0,
      showSide: false,
      ele: [],
      rKey: 0,
      selected: ['Residence', 'Athletics', 'Dining', 'Research', 'Education', 'Common'],
      show: false,
      buildingOptions: {
        onEachFeature: function (feature, layer) {
          layer.on('click', function (e) { window.vue.$eventHub.$emit('clickedPolygon', [feature.properties.story_id]) })
          layer.on('mouseover', function (e) {
            e.target.setStyle({ fillColor: '#000', color: '#000' })
            e.target.bindTooltip(e.target.feature.properties.name).openTooltip()
          })
          layer.on('mouseout', (e) => { window.vue.$eventHub.$emit('resetPolygon', [e.target]) })
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
      this.showSide = true
      this.openStory = value
    }
  },
  created () {
    this.$store.dispatch('mapdata').then(r => {
      this.polygonData = r
    })
    this.$eventHub.$on('clickedPolygon', (v) => (this.polyClick(v[0])))
    this.$eventHub.$on('resetPolygon', (v) => { this.$refs.geoLayer.mapObject.resetStyle(v[0]) })
  },
  mounted () {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject
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
.dropdownArea {
  width: 350px;
}
.dropdownArea > a:active {
  background-color: rgba(0,0,0,0);
}
.dropdownArea > a:active > * {
  color: rgb(26,26,26) !important;
}
.dropdownArea > a > * {
  color: rgb(26,26,26);
}
.mapFilterBtn {
  background-color: #FFF !important;
  color: #000 !important;
  border: solid 1px #000;
}
.mapFilterBtn:active {
  background-color: rgba(0,0,0,0.1) !important;
  color: #000 !important;
  border: solid 1px #000;
}
</style>
<style scoped>
.main {
  position: absolute;
  top: 4em;
  width:100%;
  height: calc(100% - 4em);
}
.topBar {
  box-shadow: 0px 1px 4px rgba(0,0,0,0.5);
  width:100%;
  position: absolute;
  top: -50px;
  height: 50px;
  margin-top: 50px;
  z-index: 1020;
  background-color: #FFF;
}
.topBar > .row {
  height: 100%;
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
.key {
  display: inline-block;
}
.key > .row {
  padding-left: 1.5em;
}
.key > .row > .keyEl {
  padding: 1em;
}
.swatch {
  width: 20px;
  height: 10px;
  background-color: #000;
  display: inline-block;
  margin-right: 0.5em;
  border: solid 2px #000;
}
.res.swatch {
  background-color: #D3832BB3;
  border-color: #D3832B;
}
.ath.swatch {
  background-color: #FFB500B3;
  border-color: #FFB500;
}
.din.swatch {
  background-color: #4A773CB3;
  border-color: #4A773C;
}
.rch.swatch {
  background-color: #AA9D2EB3;
  border-color: #AA9D2E;
}
.edu.swatch {
  background-color: #0D5257B3;
  border-color: #0D5257;
}
.com.swatch {
  background-color: #7A6855B3;
  border-color: #7A6855;
}
.label {
  color: #000;
  font-size: 1em;
}
.keyEl {
  display: inline-block;
}
.fil {
  display: inline-block;
  position: absolute;
  top: 0.5em;
  right: 2em;
  padding-left: 2em;
}
.col {
  display: inline-block;
}
</style>
