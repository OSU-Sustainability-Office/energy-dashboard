<template>
  <div class="main">
    <sideView ref='sideview'></sideView>
    <l-map style="height: 100%" :zoom="zoom" :center="center" ref='map'>
      <l-tile-layer :url="url" :attribution="attribution"></l-tile-layer>
      <l-polygon v-for='p in polygonData' :lat-lngs='p.polygon' @click="polyClick(p.story_id)" color='#000000' fillColor='#000000'></l-polygon>
    </l-map>

  </div>
</template>
<script>
import { LMap, LTileLayer, LMarker, LPolygon } from 'vue2-leaflet';
import sideView from '@/components/map/sideView'
import axios from 'axios';

export default {
  name: 'featured',
  components: {
    LMap,
    LTileLayer,
    LMarker,
    LPolygon,
    sideView
  },
  data() {
    return {
      zoom:15.5,
      center: L.latLng(44.565, -123.2785),
      url:'http://{s}.tile.osm.org/{z}/{x}/{y}.png',
      attribution:'&copy; <a href="http://osm.org/copyright">OpenStreetMap</a> contributors',
      map: null,
      polygonData: null
    }

  },
  methods: {
    polyClick: function(value) {
      axios.get(process.env.ROOT_API+'api/getStoryData?id='+value).then(val => {
        this.$refs.sideview.$el.style.display = "block";
        this.$refs.sideview.media = val.data[0].media;
        this.$refs.sideview.title = val.data[0].name;
      });
      axios.get(process.env.ROOT_API+'api/getBlocksForStory?id='+value).then(val => {
        var promises = [];
        val.data.forEach(row => {
          promises.push(axios.get(process.env.ROOT_API+'api/getBlockMeterGroups?id='+row.id));
        })
        Promise.all(promises).then(results => {
          var b = [];
          results.forEach(r => {
            b.push(r.data[0]);
          });
          this.$refs.sideview.blocks = b;
        });
      });
    }
  },
  created() {
    axios.get(process.env.ROOT_API+'api/getBuildingsForMap').then(res => {
      this.polygonData = res.data;
    });
  },
  mounted() {
    this.$nextTick(() => {
      this.map = this.$refs.map.mapObject;
      //this.map.$el.style.zIndex = 0;
    });
  }
}
</script>

<style >
@import "../../../node_modules/leaflet/dist/leaflet.css";
</style>
<style scoped>
.main {
  position: absolute;
  top: 50px;
  width:100%;
  height: calc(100% - 50px);
}
</style>
