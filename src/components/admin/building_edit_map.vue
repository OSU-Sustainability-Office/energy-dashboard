<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-03-14T12:29:45-07:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-03-25T14:19:59-07:00
-->
<template>
    <el-col :span='24' style='width: 100%' class='mapContainer' ref='mapContainer' v-loading='this.polygonData === null'>
      <l-map style="height: 100%; width: 100%;" :zoom="zoom" :center="center" ref='map'>
        <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
        <l-geo-json v-for='(building, index) of this.polygonData' :key='index' :geojson='building' :options='buildingOptions' ref="geoLayer"></l-geo-json>
      </l-map>
    </el-col>
</template>
<script>
import { LMap, LTileLayer, LGeoJson } from 'vue2-leaflet'
import L from 'leaflet'

export default {
  props: ['value'],
  components: {
    LMap,
    LTileLayer,
    LGeoJson
  },
  watch: {
    value: function (id) {
      for (let building of this.$refs.geoLayer) {
        if (building.geojson.properties.id === id) {
          building.mapObject.setStyle({ fillColor: '#D3832B', color: '#D3832B' })
          try {
            this.center = Object.values(building.mapObject._layers)[0]._bounds.getCenter()
          } catch (error) {
            // cant set center Leaflet API change?
            console.log(error.message)
          }
        } else {
          building.mapObject.setStyle({ fillColor: '#000', color: '#000' })
        }
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
      buildingOptions: {
        onEachFeature: (feature, layer) => {
          layer.on('click', e => {
            window.vue.$eventHub.$emit('clickedEditPolygon', [feature.properties.id, layer.getBounds().getCenter(), layer])
            // document.execCommand('copy')
          })
          layer.on('mouseover', function (e) {
            e.target.setStyle({ fillColor: '#FFF', color: '#FFF' })
            e.target.bindTooltip(e.target.feature.properties.name).openTooltip()
          })
          layer.on('mouseout', e => { window.vue.$eventHub.$emit('resetEditPolygon', [e.target]) })
        },
        style: (feature) => {
          // console.log(feature)
          var color = '#000'
          if (feature.properties.id === this.value) {
            color = '#D3832B'
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
  created () {
    this.$store.dispatch('allmapdata').then(r => {
      this.polygonData = r
    })
    this.$eventHub.$on('clickedEditPolygon', v => (this.select(v[0], v[2])))
    this.$eventHub.$on('resetEditPolygon', v => { this.$refs.geoLayer.forEach(e => { e.mapObject.resetStyle(v[0]) }) })
  },
  methods: {
    select: function (id, feature) {
      this.$emit('input', id)
      // this.$refs.geoLayer.forEach(geo => { geo.mapObject._layers.forEach(layer => { layer.setStyle({ fillColor: '#000', color: '#000' }); geo.mapObject.resetStyle(layer) }) })
      // feature.setStyle({ fillColor: '#D3832B', color: '#D3832B' })
    }
  }
}
</script>
<style scoped lang='scss'>
.mapContainer {
  background-color: blue;
  height: 400px;
  width: 50%;
}
</style>
