<template>
  <div class="main">
    <div class='topBar container-fluid'>
      <div class='row'>

        <div class='key col'>
          <div class='row'>
            <div class='col-1 label'>Key</div>
            <div class='keyEl'><div class='res swatch'></div>Residence</div>
            <div class='keyEl'><div class='din swatch'></div>Dining</div>
            <div class='keyEl'><div class='ath swatch'></div>Athletics & Rec</div>
            <div class='keyEl'><div class='rch swatch'></div>Research</div>
            <div class='keyEl'><div class='edu swatch'></div>Education</div>
            <div class='keyEl'><div class='com swatch'></div>Common</div>
          </div>
        </div>
        <div class='fil col'>
          <dropdown ref="dropdown" :not-close-elements="ele" v-model="show" class="dropdown-form" menu-right>
            <btn type="primary" class="dropdown-toggle">Filter </btn>
              <template slot="dropdown">
                <div class='container filter'>
                  <div class='row'>
                    <div class='col-xs-12 label'>Building Type</div>
                  </div>
                  <div class='row'>
                    <div class='col-xs-6'>
                      <div class='row'>
                        <div class='col-xs-12'>
                          <input type="checkbox" value='Residence' v-model="selected" checked> Residence
                        </div>
                      </div>
                      <div class='row'>
                        <div class='col-xs-12'>
                          <input type="checkbox" value='Dining' v-model="selected" checked> Dining
                        </div>
                      </div>
                      <div class='row'>
                        <div class='col-xs-12'>
                          <input type="checkbox" value='Athletics' v-model="selected" checked> Athletics & Rec
                        </div>
                      </div>
                    </div>
                    <div class='col-xs-6'>
                      <div class='row'>
                        <div class='col-xs-12'>
                          <input type="checkbox" value='Research' v-model="selected" checked> Research
                        </div>
                      </div>
                      <div class='row'>
                        <div class='col-xs-12'>
                          <input type="checkbox" value='Education' v-model="selected" checked> Education
                        </div>
                      </div>
                      <div class='row'>
                        <div class='col-xs-12'>
                          <input type="checkbox" value='Common' v-model="selected" checked> Common
                        </div>
                      </div>
                    </div>
                  </div>
                </div>

              </template>
          </dropdown>
          <!-- <label>
            View
          </label>
          <select>
            <option> Type </option>
          </select> -->
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
import axios from 'axios'
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
      // url: 'https://api.mapbox.com/styles/v1/jack-woods/cjh85kv6z0lzo2slfl00ygdit/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFjay13b29kcyIsImEiOiJjamg2aWpjMnYwMjF0Mnd0ZmFkaWs0YzN0In0.qyiDXCvvSj3O4XvPsSiBkA',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      // attribution: 'Map data &copy; <a href="https://www.openstreetmap.org/">OpenStreetMap</a> contributors, <a href="https://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, Imagery © <a href="https://www.mapbox.com/">Mapbox</a>',
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
          layer.on('mouseover', function (e) { e.target.setStyle({ fillColor: '#000', color: '#000' }) })
          layer.on('mouseout', (e) => { window.vue.$eventHub.$emit('resetPolygon', [e.target]) })
        },
        style: function (feature) {
          var color = '#000'
          switch (feature.properties.affiliation) {
            case 'Residence':
              color = '#D3832B'
              break
            case 'Education':
              color = '#0D5257'
              break
            case 'Research':
              color = '#AA9D2E'
              break
            case 'Common':
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
      axios.get(process.env.ROOT_API + 'api/getStoryData?id=' + value).then(val => {
        this.$refs.sideview.$el.style.display = 'block'
        this.$refs.sideview.media = val.data[0].media
        this.$refs.sideview.title = val.data[0].name
      })
      axios.get(process.env.ROOT_API + 'api/getBlocksForStory?id=' + value).then(val => {
        var promises = []
        val.data.forEach(row => {
          promises.push(axios.get(process.env.ROOT_API + 'api/getBlockMeterGroups?id=' + row.id))
        })
        Promise.all(promises).then(results => {
          var b = []
          results.forEach(r => {
            b.push(r.data[0])
          })
          this.$refs.sideview.blocks = b
        })
      })
    }
  },
  created () {
    axios.get(process.env.ROOT_API + 'api/getBuildingsForMap').then(res => {
      this.polygonData = res.data
    })
    this.$eventHub.$on('clickedPolygon', (v) => (this.polyClick(v[0])))
    this.$eventHub.$on('resetPolygon', (v) => { this.$refs.geoLayer.mapObject.resetStyle(v[0]) })
  },
  mounted () {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject
      // this.map.$el.style.zIndex = 0;
    })
    this.ele.push(this.$refs.dropdown.$el)
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
  z-index: 2000;
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
.container.filter {
  width: 300px;
}
.btn {
  background-color: #FFF !important;
  color: #000 !important;
}
.keyEl {
  display: inline-block;
}
.fil {
  display: inline-block;
  position: absolute;
  top: 0.5em;
  right: 2em;
}
.col {
  display: inline-block;
}
</style>
