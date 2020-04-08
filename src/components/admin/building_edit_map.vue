<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-03-14T12:29:45-07:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-03-25T14:19:59-07:00
-->
<template>
    <el-col :span='24' style='width: 100%' class='mapContainer' ref='mapContainer'>
      <l-map style="height: 100%; width: 100%;" :zoom="zoom" :center="center" ref='map' v-loading='!polygonData'>
        <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
        <l-geo-json v-for='(building) of this.polygonData' :key='building.id' :geojson='building' :options='buildingOptions' ref="geoLayer"></l-geo-json>
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
    value: {
      immediate: false,
      handler: function (id) {
        for (let building of this.$refs.geoLayer) {
          if (building.geojson.features[0].id.replace('way/', '') === id) {
            building.mapObject.setStyle({ fillColor: '#D3832B', color: '#D3832B' })
            this.map.panTo(building.mapObject.getBounds().getCenter())
          } else {
            building.mapObject.setStyle({ fillColor: '#000', color: '#000' })
          }
        }
      }
    }
  },
  data () {
    return {
      zoom: 15.5,
      loadedBounds: L.latLngBounds(L.latLng(44.565, -123.2785), L.latLng(44.565, -123.2785)),
      center: L.latLng(44.565, -123.2785),
      url: 'https://api.mapbox.com/styles/v1/jack-woods/cjmi2qpp13u4o2spgb66d07ci/tiles/256/{z}/{x}/{y}?access_token=pk.eyJ1IjoiamFjay13b29kcyIsImEiOiJjamg2aWpjMnYwMjF0Mnd0ZmFkaWs0YzN0In0.qyiDXCvvSj3O4XvPsSiBkA',
      attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      map: null,
      polygonData: null,
      buildingOptions: {
        onEachFeature: (feature, layer) => {
          layer.on('click', e => {
            this.select(e.target.feature.id.replace('way/', ''))
            // window.vue.$eventHub.$emit('clickedEditPolygon', [feature.properties.id, layer.getBounds().getCenter(), layer])
            // document.execCommand('copy')
          })
          layer.on('mouseover', e => {
            if (!e.target.setStyle) return
            if (e.target.feature.id.replace('way/', '') !== this.value) {
              e.target.oldStyle = { fillColor: e.target.options.fillColor, color: e.target.options.color }
              e.target.setStyle({ fillColor: '#FFF', color: '#FFF' })
            }
            e.target.bindTooltip(e.target.feature.properties.name).openTooltip()
          })
          layer.on('mouseout', e => {
            if (!e.target.setStyle || e.target.feature.id.replace('way/', '') === this.value) return
            e.target.setStyle({ ...e.target.oldStyle })
            // window.vue.$eventHub.$emit('resetEditPolygon', [e.target])
          })
        },
        style: (feature) => {
          // console.log(feature)
          var color = '#000'
          if (feature.id.replace('way/', '') === this.value) {
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
  async created () {
    this.$nextTick(async () => {
      this.map = this.$refs.map.mapObject

      this.map.on('moveend', e => {
        let mapLeft = this.map.getBounds().getSouthWest().lng
        let mapBottom = this.map.getBounds().getSouthWest().lat
        let mapRight = this.map.getBounds().getNorthEast().lng
        let mapTop = this.map.getBounds().getNorthEast().lat
        let fullBoundsLeft = this.loadedBounds.getSouthWest().lng
        let fullBoundsBottom = this.loadedBounds.getSouthWest().lat
        let fullBoundsRight = this.loadedBounds.getNorthEast().lng
        let fullBoundsTop = this.loadedBounds.getNorthEast().lat

        let ways = []
        if (fullBoundsRight < mapRight) {
          let bounds = L.latLngBounds(L.latLng(fullBoundsTop, fullBoundsRight), L.latLng(fullBoundsBottom, mapRight))
          // expand loaded bounds to right
          if (bounds.isValid()) {
            ways.push(this.$store.dispatch('map/boundedWays', {
              left: bounds.getSouthWest().lng,
              bottom: bounds.getSouthWest().lat,
              right: bounds.getNorthEast().lng,
              top: bounds.getNorthEast().lat
            }))
            this.loadedBounds.extend(bounds)
          }
        }

        if (fullBoundsLeft > mapLeft) {
          let bounds = L.latLngBounds(L.latLng(fullBoundsTop, mapLeft), L.latLng(fullBoundsBottom, fullBoundsLeft))
          // expand loaded bounds left
          if (bounds.isValid()) {
            ways.push(this.$store.dispatch('map/boundedWays', {
              left: bounds.getSouthWest().lng,
              bottom: bounds.getSouthWest().lat,
              right: bounds.getNorthEast().lng,
              top: bounds.getNorthEast().lat
            }))
            this.loadedBounds.extend(bounds)
          }
        }

        if (fullBoundsTop < mapTop) {
          let bounds = L.latLngBounds(L.latLng(mapTop, mapLeft), L.latLng(fullBoundsTop, mapRight))
          // expand loaded bounds upwards
          if (bounds.isValid()) {
            ways.push(this.$store.dispatch('map/boundedWays', {
              left: bounds.getSouthWest().lng,
              bottom: bounds.getSouthWest().lat,
              right: bounds.getNorthEast().lng,
              top: bounds.getNorthEast().lat
            }))
            this.loadedBounds.extend(bounds)
          }
        }

        if (fullBoundsBottom > mapBottom) {
          let bounds = L.latLngBounds(L.latLng(fullBoundsBottom, mapLeft), L.latLng(mapBottom, mapRight))
          // expand loaded bounds downwards
          if (bounds.isValid()) {
            ways.push(this.$store.dispatch('map/boundedWays', {
              left: bounds.getSouthWest().lng,
              bottom: bounds.getSouthWest().lat,
              right: bounds.getNorthEast().lng,
              top: bounds.getNorthEast().lat
            }))
            this.loadedBounds.extend(bounds)
          }
        }
        Promise.all(ways).then(data => {
          if (!this.polygonData) {
            this.polygonData = []
          }

          for (let ways of data) {
            let mapP = this.polygonData.map(p => p.features[0].id)
            for (let b of ways) {
              if (mapP.indexOf(b.features[0].id) < 0) {
                this.polygonData.push(b)
              }
            }
          }
        })

        // this.$store.dispatch('map/boundedWays', {
        //   left: this.map.getBounds().getSouthWest().lng,
        //   bottom: this.map.getBounds().getSouthWest().lat,
        //   right: this.map.getBounds().getNorthEast().lng,
        //   top: this.map.getBounds().getNorthEast().lat
        // }).then(data => {
        //   this.polygonData = data
        // })
      })
      this.map.options.zoom = 16
      this.map.options.minZoom = 16
      this.map.options.maxZoom = 16
      if (this.value) {
        let centerBuildingJSON = await this.$store.dispatch('map/buildingJSON', this.value)
        let centerBuilding = L.geoJSON(centerBuildingJSON)
        this.map.panTo(centerBuilding.getBounds().getCenter())
      } else {
        this.map.panTo(this.center)
      }
      // this.$store.dispatch('map/boundedWays', {
      //   left: this.map.getBounds().getSouthWest().lng,
      //   bottom: this.map.getBounds().getSouthWest().lat,
      //   right: this.map.getBounds().getNorthEast().lng,
      //   top: this.map.getBounds().getNorthEast().lat
      // }).then(data => {
      //   this.polygonData = data
      //   for (let building of this.$refs.geoLayer) {
      //     if (building.geojson.features[0].id.replace('way/', '') === this.value) {
      //       this.map.panTo(building.mapObject.getBounds().getCenter())
      //       break
      //     }
      //   }
      // })
    })

    // this.$store.dispatch('allmapdata').then(r => {
    //   this.polygonData = r
    // })

    // this.$eventHub.$on('clickedEditPolygon', v => (this.select(v[0], v[2])))
    // this.$eventHub.$on('resetEditPolygon', v => { this.$refs.geoLayer.forEach(e => { e.mapObject.resetStyle(v[0]) }) })
  },
  methods: {
    select: function (id) {
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
