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
          <i class="el-icon-search el-input__icon" slot="prefix"></i>
          <i
            class="el-icon-close el-input__icon"
            slot="suffix"
            @click="resetSearchInput()"
            v-if="this.search != ''"
          ></i>
        </el-input>
        <switchButtons :titles="['Category', 'Energy Trend']" v-model="grouping" />
        <el-menu-item-group v-if="grouping === 'Category'">
          <el-tooltip content="Click to toggle visibility" placement="right">
            <el-menu-item index="Academics" :class="[isDisplayed('Academics') ? 'active' : 'notactive']"
              ><span class="edu swatch"></span>Academics</el-menu-item
            >
          </el-tooltip>
          <el-menu-item index="Athletics & Rec" :class="[isDisplayed('Athletics & Rec') ? 'active' : 'notactive']"
            ><span class="ath swatch"></span>Athletics & Rec</el-menu-item
          >
          <el-menu-item index="Dining" :class="[isDisplayed('Dining') ? 'active' : 'notactive']"
            ><span class="din swatch"></span>Dining</el-menu-item
          >
          <el-menu-item index="Events & Admin" :class="[isDisplayed('Events & Admin') ? 'active' : 'notactive']"
            ><span class="com swatch"></span>Events & Admin</el-menu-item
          >
          <el-menu-item index="Residence" :class="[isDisplayed('Residence') ? 'active' : 'notactive']"
            ><span class="res swatch"></span>Residence</el-menu-item
          >
          <el-menu-item index="Solar" :class="[isDisplayed('Solar') ? 'active' : 'notactive']"
            ><span class="sol swatch"></span>Solar</el-menu-item
          >
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
        <l-map style="height: 100%; width: 100%" :zoom="zoom" :center="center" ref="map">
          <button class="resetMapButton" @click="resetMap()">Reset Map</button>
          <compareButton @startCompare="startCompare"></compareButton>
          <div @click="resetSearchInput()">
            <leftBuildingMenu class="hideMenuButton" />
          </div>
          <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
          <l-geo-json
            v-for="building of this.$store.getters['map/buildings']"
            :key="building.id * rKey"
            :geojson="building.geoJSON"
            :options="buildingOptions"
            ref="geoLayer"
          ></l-geo-json>
        </l-map>
      </div>
      <prompt v-if="askingForComparison" @cancel="stopCompare" @compare="showComparison" />
      <prompt_error v-if="building_compare_error" @cancel="stopCompareError" @compare="showComparison" />
      <transition name="side">
        <compareSide v-if="showCompareSide" @hide="showCompareSide = false" :compareStories="compareStories" />
        <sideView ref="sideview" v-if="showSide" @hide="showSide = false" @startCompare="startCompare"></sideView>
      </transition>
    </el-col>
  </el-row>
</template>
<script>
import { LMap, LTileLayer, LGeoJson } from 'vue2-leaflet'
import sideView from '@/components/map/sideView'
import compareButton from '@/components/map/compareButton'
import prompt from '@/components/map/map_prompt'
import prompt_error from '@/components/map/prompt_error'
import compareSide from '@/components/map/map_compareside'
import L from 'leaflet'
import switchButtons from '@/components/map/switch_buttons'
import { EventBus } from '../../event-bus'
import leftBuildingMenu from '@/components/leftBuildingMenu'

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
    compareButton
  },
  computed: {
    showSide: {
      get () {
        return this.$store.getters['modalController/modalName'] === 'map_side_view'
      },

      set ( value ) {
        this.$store.dispatch( 'modalController/closeModal' )
      }
    },
    showCompareSide: {
      get () {
        return this.$store.getters['modalController/modalName'] === 'map_compare_side'
      },

      set ( value ) {
        this.$store.dispatch( 'modalController/closeModal' )
      }
    }
  },
  data () {
    return {
      searchGroup: [],
      search: '',
      zoom: DEFAULT_ZOOM,
      center: L.latLng( DEFAULT_LAT, DEFAULT_LON ),
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
        'Residence',
        'Athletics & Rec',
        'Dining',
        'Academics',
        'Events & Admin',
        'Solar',
        'Stable Trend',
        'Up Trend',
        'Down Trend'
      ],
      show: false,
      mapLoaded: false,
      buildingOptions: {
        onEachFeature: ( feature, layer ) => {
          layer.on( 'click', e => {
            this.polyClick( e.target.feature.properties.id, e.target.feature, layer.getBounds().getCenter() )
          } )
          layer.on( 'mouseover', function ( e ) {
            if ( !e.target.setStyle ) return
            if ( e.target.feature.id === 'way/1100972272' ) {
              e.target.feature.properties.name = 'OSU Operations'
            }
            e.target.oldStyle = {
              fillColor: e.target.options.fillColor,
              color: e.target.options.color
            }
            e.target.setStyle( { fillColor: '#000', color: '#000' } )
            e.target.bindTooltip( e.target.feature.properties.name ).openTooltip()
          } )
          layer.on( 'mouseout', e => {
            if ( !e.target.setStyle ) return
            e.target.setStyle( { ...e.target.oldStyle } )
          } )
        },
        style: feature => {
          var color = '#000'
          switch ( feature.properties.group ) {
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
            case 'Solar':
              color = '#4169E1'
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
    polyClick: function ( id, feature, center ) {
      if ( !this.askingForComparison ) {
        window.vue.$store.dispatch( 'modalController/openModal', {
          name: 'map_side_view',
          id: id
        } )
      } else {
        if ( this.askingForComparison && this.compareStories.indexOf( id ) < 0 ) {
          const data =
            "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><circle cx='256' cy='256' r='246' fill='#D73F09' stroke='#FFF' stroke-width='20'/><path transform='scale(0.7 0.7) translate(76.8 86.8)' fill='#FFF' d='M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z'></path></svg>"
          const formed = encodeURI( 'data:image/svg+xml,' + data ).replace( /#/g, '%23' )
          const checkIcon = L.icon( {
            iconUrl: formed,
            iconSize: [20, 20],
            shadowUrl: ''
          } )
          const marker = L.marker( center, {
            icon: checkIcon,
            bubblingMouseEvents: true,
            interactive: false
          } ).addTo( this.map )
          marker.buildingId = id
          this.compareMarkers.push( marker )
          this.compareStories.push( id )
        } else if ( this.askingForComparison ) {
          const removingMarkerIndex = this.compareMarkers.findIndex( e => e.buildingId === id )
          if ( removingMarkerIndex === -1 ) {
            return
          }
          const marker = this.compareMarkers.splice( removingMarkerIndex, 1 )[0]
          this.map.removeLayer( marker )
          this.compareStories.splice( this.compareStories.indexOf( id ), 1 )
        }
      }
    },
    resetMap () {
      this.map.setView( L.latLng( DEFAULT_LAT, DEFAULT_LON ), DEFAULT_ZOOM )
      for ( let layer of Object.values( this.map._layers ) ) {
        layer.unbindTooltip()
      }
    },
    getResult ( searchResult ) {
      for ( let layer of Object.values( this.map._layers ) ) {
        layer.unbindTooltip()
      }
      let searchLatLng = searchResult.getBounds().getCenter()
      searchLatLng.lng = searchLatLng.lng - 0.003
      this.map.setView( L.latLng( searchLatLng ), DEFAULT_ZOOM )
      searchResult
        .bindTooltip( searchResult.feature.properties.name, { permanent: true, fillColor: '#000', color: '#000' } )
        .openTooltip()
    },
    resetSearchInput () {
      this.search = ''
    },
    removeAllMarkers: function () {
      for ( let marker of this.compareMarkers ) {
        this.map.removeLayer( marker )
      }
    },
    showComparison: async function ( target ) {
      this.askingForComparison = false
      this.removeAllMarkers()
      console.log( this.compareStories[0] )
      if ( this.compareStories[0] === undefined ) {
        this.compareStories.shift()
        if ( this.compareStories[0] === undefined ) {
          this.showSide = false
          this.building_compare_error = true
        }
      }
      console.log( this.compareStories[0] )
      let path = this.$store.getters['map/building']( this.compareStories[0] ).path
      console.log( this.$store.getters['map/building']( this.compareStories[0] ).description )
      if ( this.$store.getters['map/building']( this.compareStories[0] ).description !== 'Electricity' ) {
        this.showSide = false
        this.building_compare_error = true
      }
      if ( target === 'q' ) {
        let mgId = this.$store.getters[path + '/primaryGroup']( 'Electricity' ).id

        let blockSpace = this.$store.getters[path + '/block']( mgId ).path
        await this.$store.dispatch( blockSpace + '/removeAllModifiers' )
        await this.$store.dispatch( blockSpace + '/addModifier', 'building_compare' )
        await this.$store.dispatch( blockSpace + '/updateModifier', {
          name: 'building_compare',
          data: {
            buildingIds: this.compareStories
          }
        } )
        window.vue.$store.dispatch( 'modalController/openModal', {
          name: 'map_compare_side',
          path: path
        } )
      } else {
        this.$router.push( {
          path: `/compare/${encodeURI( JSON.stringify( this.compareStories ) )}/2`
        } )
      }
    },
    startCompare: function ( buildingId ) {
      this.showSide = false
      this.askingForComparison = true
      this.compareStories = []
      this.compareStories.push( buildingId )

      const data =
        "<svg xmlns='http://www.w3.org/2000/svg' viewBox='0 0 512 512'><circle cx='256' cy='256' r='246' fill='#D73F09' stroke='#FFF' stroke-width='20'/> <path transform='scale(0.7 0.7) translate(76.8 86.8)' fill='#FFF' d='M173.898 439.404l-166.4-166.4c-9.997-9.997-9.997-26.206 0-36.204l36.203-36.204c9.997-9.998 26.207-9.998 36.204 0L192 312.69 432.095 72.596c9.997-9.997 26.207-9.997 36.204 0l36.203 36.204c9.997 9.997 9.997 26.206 0 36.204l-294.4 294.401c-9.998 9.997-26.207 9.997-36.204-.001z'></path></svg>"
      const formed = encodeURI( 'data:image/svg+xml,' + data ).replace( /#/g, '%23' )
      const checkIcon = L.icon( {
        iconUrl: formed,
        iconSize: [20, 20],
        shadowUrl: ''
      } )
      let center = null
      for ( let layer of Object.values( this.map._layers ) ) {
        if (
          layer.feature &&
          layer.feature.geometry &&
          layer.feature.geometry.type === 'Polygon' &&
          layer.feature.properties.id === buildingId
        ) {
          center = layer.getBounds().getCenter()
        }
      }
      if ( !center ) {
        return
      }
      const marker = L.marker( center, {
        icon: checkIcon,
        bubblingMouseEvents: true,
        interactive: false
      } ).addTo( this.map )
      marker.buildingId = buildingId
      this.compareMarkers.push( marker )
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
    isDisplayed: function ( v ) {
      if ( this.selected.indexOf( v ) >= 0 ) {
        return true
      } else {
        return false
      }
    },
    handleSelect: function ( string ) {
      if ( this.selected.indexOf( string ) >= 0 ) {
        this.selected.splice( this.selected.indexOf( string ), 1 )
      } else {
        this.selected.push( string )
      }
    },
    computedColor: function ( percentage ) {
      // #d62326 - Bottom Red
      // #19a23a - Top Green
      const redInt = [parseInt( '0xd6', 16 ), parseInt( '0x23', 16 ), parseInt( '0x26', 16 )]
      const greenInt = [parseInt( '0x19', 16 ), parseInt( '0xa2', 16 ), parseInt( '0x3a', 16 )]
      const typicalColor = [redInt[0] - greenInt[0], greenInt[1] - redInt[1], greenInt[2] - redInt[2]]
      const compare = Math.abs( percentage ) / 0.01
      const result = []
      if ( percentage < -0.01 ) {
        result.push( greenInt[0] )
        result.push( greenInt[1] )
        result.push( greenInt[2] )
      } else if ( percentage > 0.01 ) {
        result.push( redInt[0] )
        result.push( redInt[1] )
        result.push( redInt[2] )
      } else if ( percentage < 0 ) {
        result.push( Math.round( typicalColor[0] - redInt[0] * compare ) )
        result.push( Math.round( typicalColor[1] + redInt[1] * compare ) )
        result.push( Math.round( typicalColor[2] + redInt[2] * compare ) )
      } else {
        result.push( Math.round( typicalColor[0] + greenInt[0] * compare ) )
        result.push( Math.round( typicalColor[1] - greenInt[1] * compare ) )
        result.push( Math.round( typicalColor[2] - greenInt[2] * compare ) )
      }
      return 'rgb(' + result[0].toString() + ',' + result[1].toString() + ',' + result[2].toString() + ')'
    }
  },
  async created () {
    await this.$store.dispatch( 'map/loadGeometry' )
    this.mapLoaded = true
    this.message = window.innerWidth > 844
    EventBus.$on( 'inputData', inputWord => {
      this.message = inputWord
    } )
    this.map.zoomControl.setPosition( 'topleft' )
  },
  mounted () {
    this.$nextTick( () => {
      this.map = this.$refs.map.mapObject
    } )
  },
  watch: {
    grouping: {
      handler: function ( value ) {
        this.search = ''
        this.rKey++
        this.mapLoaded = false
        this.$nextTick( async () => {
          this.map = this.$refs.map.mapObject
          let promises = []
          for ( var layerKey of Object.keys( this.map._layers ) ) {
            let layer = this.map._layers[layerKey]
            if ( layer.feature ) {
              if ( this.grouping === 'Category' ) {
                var color = '#000'
                switch ( layer.feature.properties.group ) {
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
                  case 'Solar':
                    color = '#4169E1'
                    break
                  default:
                    break
                }
                layer.setStyle( { fillColor: color, color: color } )
              } else if ( this.grouping === 'Energy Trend' ) {
                promises.push(
                  new Promise( async ( resolve, reject ) => {
                    /*
                    Ok, it *looks like* each Vuex logical object (building, chart, block, etc.)
                    contains a promise to resolve the data required from the api.  Unsure if
                    it's actually being used in practice.
                  */
                    await this.$store.getters['map/promise']
                    // Retrieves building object from store using leaflet property id
                    let building = this.$store.getters['map/building']( layer.feature.properties.id )
                    await this.$store.getters[building.path + '/promise']
                    let mg = this.$store.getters[building.path + '/primaryGroup']( 'Electricity' )
                    if ( mg == null ) {
                      console.error( building.name, building.path, building )
                      resolve()
                    }
                    let defaultBlock = this.$store.getters[building.path + '/block']( mg.id )
                    await this.$store.getters[defaultBlock.path + '/promise']
                    let defaultChart = this.$store.getters[defaultBlock.path + '/charts'][0]
                    let currentDate = new Date()
                    let minus60 = new Date( currentDate.getTime() - 60 * 24 * 60 * 60 * 1000 )
                    const reqPayload = {
                      dateEnd: parseInt( ( currentDate.getTime() - ( currentDate.getTime() % 900 ) * 1000 ) / 1000 ),
                      dateStart: parseInt( ( minus60.getTime() - ( minus60.getTime() % 900 ) * 1000 ) / 1000 ),
                      intervalUnit: 'day',
                      dateInterval: 1,
                      graphType: 1
                    }
                    let data = await this.$store.dispatch( defaultChart.path + '/getData', reqPayload )
                    // Below is an algorithm to compute least squares linear regression
                    let meanY = 0
                    for ( let index = 0; index < data.data.length; index++ ) {
                      meanY += data.data[index].y
                    }
                    meanY /= data.data.length
                    let meanX = data.data.length / 2 // No need to use date can just use index
                    let accmxx = 0
                    let accmxxyy = 0
                    for ( let index = 0; index < data.data.length; index++ ) {
                      accmxx += Math.pow( index - meanX, 2 ) // index - meanX
                      accmxxyy += ( data.data[index].y - meanY ) * ( index - meanX )
                    }
                    // accmxx =
                    let slope = accmxxyy / accmxx
                    let normalizedSlope = slope / meanY
                    // slope /= 30
                    layer.setStyle( {
                      fillColor: this.computedColor( normalizedSlope ),
                      color: this.computedColor( normalizedSlope )
                    } )
                    // if (normalizedSlope > 0.001) {
                    //   layer.setStyle({ fillColor: '#d62326', color: '#d62326' })
                    // } else if (normalizedSlope < -0.001) {
                    //   layer.setStyle({ fillColor: '#4A773C', color: '#4A773C' })
                    // } else {
                    //   layer.setStyle({ fillColor: '#FFB500', color: '#FFB500' })
                    // }
                    resolve()
                  } )
                )
              }
            }
          }
          await Promise.all( promises )
          this.mapLoaded = true
        } )
      }
    },
    search: function ( v ) {
      if ( v === '' ) {
        this.searchGroup = []
        return
      }
      var searchGroup = []
      for ( let layer of Object.values( this.map._layers ) ) {
        if ( layer.feature && layer.feature.geometry && layer.feature.geometry.type === 'Polygon' ) {
          if ( layer.feature.id === 'way/1100972272' ) {
            layer.feature.properties.name = 'OSU Operations'
          }

          if ( layer.feature.properties.name !== undefined ) {
            if ( layer.feature.properties.name.toLowerCase().includes( v.toLowerCase() ) ) {
              searchGroup.push( layer )
            }
          }
        }
      }
      this.searchGroup = searchGroup
    },
    selected: function ( val ) {
      this.rKey++
      this.$nextTick( () => {
        this.map = this.$refs.map.mapObject
        for ( var layerKey of Object.keys( this.map._layers ) ) {
          let layer = this.map._layers[layerKey]
          if ( layer.feature ) {
            if ( !val.includes( layer.feature.properties.group ) && this.grouping === 'Category' ) {
              this.map.removeLayer( layer )
            }
          }
        }
      } )
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
  color: $--color-white;
  font-size: 26px;
  text-align: center;
  font-family: 'stratumno2';
}
.stage {
  padding: 0;
  position: absolute;
  width: 100%;
  height: 100%;
}

.el-menu-item {
  height: 30px;
  position: static;
}

.sideMenu {
  background-color: $--color-black;
  position: absolute;
  left: 0;
  z-index: 2000;
  width: $sideMenu-width - 10px;
  padding-top: 0.5em;
  top: 110px;
}

::v-deep .el-menu-item-group__title {
  margin-top: -50px;
}

.el-menu-item-group {
  margin-top: 45px;
  margin-bottom: 27px;
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
  left: 0px;
  height: 100%;
  width: calc(100%);
}

.hideMenuButton {
  display: flex;
  position: absolute;
  top: 80px;
  left: 10px;
}
.side-enter-active,
.side-leave-active {
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
  color: #ffffff66 !important;
}
.active {
  color: #ffffff !important;
}
.notactive .swatch {
  background-color: #ffffff22;
  border-color: #ffffff44;
}
.active .res.swatch {
  background-color: #d3832bb3;
  border-color: #d3832b;
}
.active .ath.swatch {
  background-color: #ffb500b3;
  border-color: #ffb500;
}
.active .din.swatch {
  background-color: #4a773cb3;
  border-color: #4a773c;
}
.active .rch.swatch {
  background-color: #aa9d2eb3;
  border-color: #aa9d2e;
}
.active .edu.swatch {
  background-color: #0d5257b3;
  border-color: #0d5257;
}
.active .com.swatch {
  background-color: #7a6855b3;
  border-color: #7a6855;
}
.active .sol.swatch {
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
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
  display: flex;
  align-items: center;
  position: absolute;
  top: 10px;
  left: 50px;
  width: 90px;
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
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
  display: flex;
  align-items: center;
  position: absolute;
  top: 45px;
  left: 10px;
  width: 220px;
  height: 40px;
  background-color: white;
  border: 2px solid rgba(0, 0, 0, 0.2);
  background-clip: padding-box;
  border-radius: 4.5px;
  opacity: 1;
  justify-content: center;
  z-index: 500;
}
::v-deep .el-input__icon {
  color: #d73f09;
}
::v-deep .el-input__suffix {
  font-size: 28px;
}
.searchMapResult {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
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
.el-icon-close {
  cursor: pointer;
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
