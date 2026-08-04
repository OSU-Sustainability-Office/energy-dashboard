<!--
  Filename:  BuildingListItem.vue
  Info: The individual building cards that are displayed in the building list.
-->
<template>
  <div
    class="card"
    ref="card"
    v-lazy-bg="thumbnailBackground"
    @click="clicked($event)"
    @mouseover="hover(true)"
    @mouseleave="hover(false)"
  >
    <span class="name" v-if="!plus">{{ name }}</span>
    <span class="description" v-if="!plus">{{ description }}</span>
  </div>
</template>

<script>
import lazyBg from '@/directives/lazy_background.js'

export default {
  props: ['id', 'building', 'plus'],
  directives: {
    lazyBg
  },
  data() {
    return {
      api: import.meta.env.VITE_ROOT_API
    }
  },

  computed: {
    // Handed to v-lazy-bg rather than applied on mount: the buildings tab renders
    // every card up front, and fetching all of their thumbnails at once costs
    // over 13MB for images the user mostly never scrolls to. Null when the
    // building has no image, which leaves the card's base colour showing.
    thumbnailBackground: {
      get() {
        if (!this.media) {
          return null
        }
        return (
          'linear-gradient(to bottom right, rgba(0, 0, 0, 0.9), rgba(0, 0, 0, 0.2)), ' +
          `url("https://osu-energy-images.s3-us-west-2.amazonaws.com/thumbnails/${this.media}")`
        )
      }
    },

    buildingData: {
      get() {
        return this.$store.getters['map/building'](this.id)
      }
    },
    media: {
      get() {
        return this.buildingData.image
      }
    },
    name: {
      get() {
        return this.buildingData.name
      }
    },
    description: {
      get() {
        return this.buildingData.description
      }
    }
  },

  methods: {
    hover: function (enter) {
      if (this.$refs.toolbox) {
        if (enter) {
          this.$refs.toolbox.style.display = 'block'
        } else {
          this.$refs.toolbox.style.display = 'none'
        }
      }
    },
    clicked: function (event) {
      if (event.target.parentNode.classList.contains('toolbox') || event.target.classList.contains('toolbox')) {
        return
      }
      this.$emit('click')
    }
  },

  watch: {
    selected: function (value) {
      if (value) {
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
  font-family: 'StratumNo2';
  font-size: 1.7em;
  display: block;
  z-index: 1;
}
.card {
  color: $color-white;
  position: relative;
  /* Base for the lazily-applied thumbnail: shown while the image is still
     pending, and left in place for buildings with no image at all. */
  background-color: rgb(26, 26, 26);
  background-position: center;
  background-size: cover;
  background-repeat: no-repeat;
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
  box-shadow: 0 0 12px $color-primary;
  outline-offset: -5px;
}

.card:hover .plus .fas {
  color: $color-black !important;
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
  font-family: 'StratumNo2';
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
