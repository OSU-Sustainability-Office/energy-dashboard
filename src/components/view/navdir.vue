<!--
  Filename: navdir.vue
  Info: From README:
    "This component is the small navigation bar underneath the heroPicture. It offers quick routing between stories and groups."
-->
<!--
    TODO: Remove isBuilding / publicview / otherview if it is later confirmed we don't need to show any part of navdir
    (e.g. share link and download buttons) on the comparison pages.
    "navVis" in view.vue currently hides the navdir on all non-building pages anyways.
-->
<template>
  <el-row class="stage">
    <el-col class="main">
      <el-row class="bar">
        <el-col :span="20">
          <el-menu
            v-if="!otherView"
            mode="horizontal"
            class="menu"
            background-color="#FFF"
            text-color="#1a1a1a"
            :router="true"
            @select="handleSelect"
          >
            <el-sub-menu index="1" :router="true">
              <template #title><i class="fas fa-th-large"></i>{{ group1Name }}</template>
              <el-menu-item
                class="group-item"
                v-for="(groupS, index) in group1"
                :key="groupS.id"
                :index="'1-' + index"
                :route="{
                  path: (publicView ? '/buildings/' : '/view/') + groupS.id
                }"
              >
                <i class="fas fa-th-large"></i>{{ groupS.name }}
              </el-menu-item>
            </el-sub-menu>
            <el-sub-menu index="2" :router="false" v-if="publicView">
              <template #title><i class="fas fa-building"></i>{{ group2Name }}</template>
              <el-menu-item
                class="story-item"
                v-for="(storyS, index) in group2"
                :key="storyS.id"
                :index="'2-' + index"
                :route="{ path: `/building/${storyS.id}/2` }"
              >
                <i class="fas fa-building"></i>{{ storyS.name }}
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
          <span v-if="otherView"> &nbsp; </span>
        </el-col>
        <el-col :span="4" class="buttons">
          <el-tooltip v-if="isBuilding" content="Click to compare multiple time periods">
            <i class="fas fa-clock" @click="compareTimePeriods()"></i>
          </el-tooltip>
          <el-tooltip content="Click to copy share link">
            <i class="fas fa-share-square" @click="copyUrl()"></i>
          </el-tooltip>
          <!-- <el-tooltip content='Click to save story' placement='top'>
                <i class="fas fa-save" v-if='story.user_id === user.id' @click="$emit('save')"></i>
              </el-tooltip> -->
          <el-tooltip content="Click to download data" placement="top">
            <i class="fas fa-download" @click="download()"></i>
          </el-tooltip>
        </el-col>
      </el-row>
    </el-col>
    <downloader />
  </el-row>
</template>

<script>
import downloader from '@/components/view/modals/download_data.vue'

export default {
  name: 'navdir',
  props: ['groupContents'],
  components: {
    downloader
  },
  up: 0,
  data () {
    return {
      groupName: '',
      filteredGroups: [],
      navStories: [],
      path: [],
      group: {
        group: '',
        public: false
      }
    }
  },
  mounted () {
    this.update()
  },
  computed: {
    viewOrBuilding: {
      get () {
        if (this.publicView) {
          return this.$store.getters['map/building'](this.$route.params.id)
        } else {
          return this.$store.getters['view']
        }
      }
    },
    group1: {
      get () {
        if (this.publicView) {
          let groups = this.$store.getters['map/buildingGroups']
          let rValue = []

          for (let group of groups) {
            rValue.push({ name: group, id: group })
          }
          return rValue
        } else {
          // References to anything about "user", "users", "personal", etc are an obsolete admin frontend feature.
          // All references to these things (at least in .vue files) hould be removed in a future PR, but out of scope for now.
          return this.$store.getters['user/views']
        }
      }
    },
    group2: {
      get () {
        if (!this.viewOrBuilding) return
        if (this.publicView) {
          let buildings = this.$store.getters['map/buildingsForGroup'](this.viewOrBuilding.group)
          let rValue = []

          for (let building of buildings) {
            rValue.push({ name: building.name, id: building.id })
          }
          return rValue
        } else {
          return []
        }
      }
    },
    group1Name: {
      get () {
        if (!this.viewOrBuilding) return
        if (this.publicView) {
          return this.viewOrBuilding.group
        } else {
          return this.viewOrBuilding.name
        }
      }
    },
    group2Name: {
      get () {
        if (!this.viewOrBuilding) return
        return this.viewOrBuilding.name
      }
    },
    publicView: {
      get () {
        return this.$route.path.includes('building')
      }
    },
    otherView: {
      get () {
        if (this.viewOrBuilding) {
          if (this.viewOrBuilding.path === 'view') {
            return true
          }
        }
        return false
      }
    },
    // this checks if page is in /building path
    isBuilding: {
      get () {
        try {
          if (this.$store.getters['map/building'](this.$route.params.id).path) {
            return true
          } else {
            return false
          }
        } catch (err) {
          return false
        }
      }
    }
  },
  methods: {
    update: async function () {
      this.path = this.$route.path.split('/')
      if (this.path.includes('building')) {
        // Public View
        this.public = true
        this.dontShow = false
      } else {
        // Personal View
        this.public = false
        if (!this.viewOrBuilding) {
          this.dontShow = true
        }
      }
    },
    copyUrl: function () {
      const el = document.createElement('textArea')
      el.value = window.location.href
      el.setAttribute('readonly', '')
      el.style.position = 'absolute'
      el.style.left = '-9999px'
      document.body.appendChild(el)
      el.select()
      document.execCommand('copy')
      document.body.removeChild(el)
      this.$message({
        message: 'Link copied to clipboard',
        type: 'success'
      })
    },
    download: function () {
      this.$store.dispatch('modalController/openModal', {
        name: 'download_data',
        view: this.viewOrBuilding.path
      })
    },
    compareTimePeriods: function () {
      let buildingID = JSON.stringify(this.$route.params.id)
      this.$router.push({
        path: `/compare/${encodeURI('[' + buildingID + ']')}/2`
      })
    },
    populate: function () {
      this.filteredGroups = []
      this.group = this.stories.find(p => {
        return p.stories.find(e => {
          return e.name === this.story.name
        })
      })
      if (!this.group) {
        return
      }
      for (let story of this.stories) {
        if (story.public === this.group.public) {
          this.filteredGroups.push(story)
        }
      }
      this.navStories = this.group.stories
    },
    handleSelect: function (index) {
      if (index[0] === '2') {
        this.$nextTick(() => {
          this.$emit('update')
        })
      }
    }
  }
}
</script>
<style lang="scss">
.el-menu--horizontal > .el-sub-menu.is-active .el-sub-menu__title {
  border: none !important;
}
.el-sub-menu__title:hover {
  color: $color-white !important;
  background-color: $color-black !important;
}
.el-sub-menu.is-opened > .el-sub-menu__title {
  color: $color-white !important;
  background-color: $color-black !important;
}
</style>
<style scoped lang="scss">
.stage {
  position: relative !important;
  top: 0 !important;
  left: 0 !important;
  height: 60px !important;
}
.main {
  padding: 0;
}
.bar {
  position: absolute;
  top: 0px;
  left: 0px;
  height: 100%;
  width: 100%;
  padding: 0;
  background-color: $color-white;
  box-shadow: 0px 2px 4px -2px rgba(0, 0, 0, 0.5);
}
.menu {
  margin: 0;
}

.fas {
  color: $color-primary !important;
  padding: 0.5em;
}
.el-menu-item:hover {
  color: $color-white !important;
  background-color: $color-black !important;
}
.buttons {
  text-align: right;
}
.buttons .fas {
  transition: color 0.2s ease;
  font-size: 1.5em;
  line-height: 60px;
  padding: 0;
  padding-right: 0.8em;
  cursor: pointer;
}
.buttons .fas:hover {
  color: $color-black !important;
}
</style>
