<!--
  Filename: BuildingPanelNavigation.vue
  Info: Navigation bar that appears below the hero picture in the full chart page.
  It contains menus to switch between groups and buildings, as well as the share link
  and download buttons.
-->
<template>
  <el-row class="stage">
    <el-col class="main">
      <el-row class="bar">
        <el-col :span="20">
          <el-menu mode="horizontal" class="menu" background-color="#FFF" text-color="#1a1a1a" :router="true">
            <!-- Menu for building groups -->
            <el-sub-menu index="1" :router="true">
              <template #title><i class="fas fa-th-large"></i>{{ groupName }}</template>
              <el-menu-item
                class="group-item"
                v-for="(group, idx) in buildingGroups"
                :key="group.id"
                :index="'1-' + idx"
                :route="{ path: '/buildings/' + group.id }"
              >
                <i class="fas fa-th-large"></i>{{ group.name }}
              </el-menu-item>
            </el-sub-menu>
            <!-- Menu for all buildings within the building group -->
            <el-sub-menu index="2" :router="false">
              <template #title><i class="fas fa-building"></i>{{ buildingName }}</template>
              <el-menu-item
                v-for="(building, idx) in buildingsForGroup"
                :key="building.id"
                :index="'2-' + idx"
                :route="{ path: `/building/${building.id}/2` }"
              >
                <i class="fas fa-building"></i>{{ building.name }}
              </el-menu-item>
            </el-sub-menu>
          </el-menu>
        </el-col>
        <el-col :span="4" class="buttons">
          <!-- Compare time periods button -->
          <el-tooltip v-if="isBuilding" content="Click to compare multiple time periods">
            <i class="fas fa-clock" @click="compareTimePeriods()"></i>
          </el-tooltip>
          <!-- Copy share link button -->
          <el-tooltip content="Click to copy share link">
            <i class="fas fa-share-square" @click="copyUrl()"></i>
          </el-tooltip>
          <!-- Download button -->
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
import downloader from '@/components/building_view/modals/DownloadData.vue'

export default {
  name: 'BuildingPanelNavigation',
  components: {
    downloader
  },
  computed: {
    // Returns current building object
    building: {
      get() {
        return this.$store.getters['map/building'](this.$route.params.id)
      }
    },
    // Returns all building groups
    buildingGroups: {
      get() {
        let groups = this.$store.getters['map/buildingGroups']
        let rValue = []

        for (let group of groups) {
          rValue.push({ name: group, id: group })
        }
        return rValue
      }
    },
    // Returns all buildings in the current group
    buildingsForGroup: {
      get() {
        if (!this.building) return
        let buildings = this.$store.getters['map/buildingsForGroup'](this.building.group)
        let rValue = []

        // filter out buildings that are not in the current group
        for (let building of buildings) {
          rValue.push({ name: building.name, id: building.id })
        }
        return rValue
      }
    },
    // Returns current building group
    groupName: {
      get() {
        if (!this.building) return
        return this.building.group
      }
    },
    // Returns current building name
    buildingName: {
      get() {
        if (!this.building) return
        return this.building.name
      }
    },
    // This checks if page is in /building path (don't show BuildingPanelNavigation on comparison pages)
    isBuilding: {
      get() {
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
        name: 'DownloadData',
        view: this.building.path
      })
    },
    compareTimePeriods: function () {
      let buildingID = JSON.stringify(this.$route.params.id)
      this.$router.push({
        path: `/compare/${encodeURI('[' + buildingID + ']')}/2`
      })
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
  .el-menu--popup.el-menu--popup-bottom-start {
    max-height: 300px;
    overflow-y: auto;

    // Firefox
    scrollbar-width: thin;
    scrollbar-color: #888 #f1f1f1;

    // Chromium/Safari
    &::-webkit-scrollbar {
      width: 6px;
    }

    &::-webkit-scrollbar-track {
      background: #f1f1f1;
    }

    &::-webkit-scrollbar-thumb {
      background: #888;
      border-radius: 3px;

      &:hover {
        background: #555;
      }
    }
  }
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
