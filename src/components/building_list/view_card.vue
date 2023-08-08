<template>
  <div
    class="card"
    ref="card"
    @click="clicked($event)"
    @mouseover="hover(true)"
    @mouseleave="hover(false)"
  >
    <div class="toolbox" ref="toolbox" v-if="!plus && !building">
      <el-tooltip content="Edit View" placement="top">
        <i class="fas fa-pencil-alt" @click.prevent="openEdit()"></i>
      </el-tooltip>
      <el-tooltip content="Delete View" placement="top">
        <i class="fas fa-times" @click="deleteView()"></i>
      </el-tooltip>
    </div>
    <span class="name" v-if="!plus">{{ name }}</span>
    <span class="description" v-if="!plus">{{ description }}</span>
    <div class="plus" v-if="plus">
      <i class="fas fa-plus"></i>
    </div>
  </div>
</template>

<script>
export default {
  props: ['id', 'building', 'plus'],
  data () {
    return {
      api: process.env.VUE_APP_ROOT_API
    }
  },
  mounted () {
    if ( this.media ) {
      this.$refs.card.style.background =
        'linear-gradient(to bottom right, rgba(0, 0, 0, 0.9),  rgba(0, 0, 0, 0.2)),url("https://osu-energy-images.s3-us-west-2.amazonaws.com/thumbnails/' +
        this.media +
        '") center/cover no-repeat'
    } else {
      this.$refs.card.style.backgroundColor = 'rgb(26,26,26)'
    }
  },

  computed: {
    buildingOrStory: {
      get () {
        if ( this.building ) {
          return this.$store.getters['map/building']( this.id )
        } else {
          return this.$store.getters['user/view']( this.id )
        }
      }
    },
    media: {
      get () {
        return this.buildingOrStory.image
      }
    },
    name: {
      get () {
        return this.buildingOrStory.name
      }
    },
    description: {
      get () {
        return this.buildingOrStory.description
      }
    }
  },

  methods: {
    hover: function ( enter ) {
      if ( this.$refs.toolbox ) {
        if ( enter ) {
          this.$refs.toolbox.style.display = 'block'
        } else {
          this.$refs.toolbox.style.display = 'none'
        }
      }
    },
    openEdit: function () {
      this.$store.dispatch( 'modalController/openModal', {
        name: 'edit_view',
        id: this.id
      } )
    },
    clicked: function ( event ) {
      if (
        event.target.parentNode.classList.contains( 'toolbox' ) ||
        event.target.classList.contains( 'toolbox' )
      ) {
        return
      }
      this.$emit( 'click' )
    },
    deleteView: function () {
      this.$store.dispatch( 'modalController/openModal', {
        name: 'confirm_delete',
        id: this.id
      } )
    }
  },

  watch: {
    selected: function ( value ) {
      if ( value ) {
        this.$refs.card.style.borderColor = 'rgb(215,63,9)'
        this.$refs.card.style.borderWidth = '4px'
      } else {
        this.$refs.card.style.borderColor = 'rgb(0,0,0)'
        this.$refs.card.style.borderWidth = '2.5px'
      }
    }
  }
}
</script>

<style lang="scss" scoped>
.toolbox {
  position: absolute;
  right: 10px;
  top: 5px;
  display: none;
  cursor: pointer;
}
.fas {
  color: #ffffff88;
  font-size: 1.5em;
  padding-left: 0.2em;
}
.fas.fa-times {
  font-size: 1.8em;
}
.name {
  font-family: "StratumNo2";
  font-size: 1.7em;
  display: block;
  z-index: 1;
}
.card {
  color: $--color-white;
  position: relative;
  border: 2.5px solid rgb(0, 0, 0);
  padding: 1em;
  height: 150px;
  margin: 1em;
  border-radius: 5px;
  overflow: hidden;
  margin: auto;
  cursor: pointer;
  transition: box-shadow 0.2s ease-in-out;
}

.card:hover {
  box-shadow: 0 0 12px $--color-primary;
  outline-offset: -5px;
}

.card:hover .plus .fas {
  color: $--color-black !important;
}
.image {
  position: absolute;
  right: 0px;
  bottom: 0px;
  height: 100%;
  z-index: 0;
}
.description {
  color: #fff;
  font-family: "StratumNo2";
  font-size: 1.2em;
  display: block;
  padding-left: 0.3em;
  z-index: 1;
  -webkit-text-stroke: 0.3px black;
}
.plus {
  text-align: center;
  padding-right: 1em;
}
.plus .fas {
  font-size: 6em;
  line-height: 150px;
  text-align: center;
  width: calc(100% - 0.33em);
}
.plus .fas {
  color: rgb(215, 63, 9) !important;
}
</style>
