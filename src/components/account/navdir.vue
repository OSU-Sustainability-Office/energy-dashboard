<template>
  <el-row class='stage'>
    <el-col class='main'>
        <el-row class='bar'>
          <el-col :span='20'>
            <el-menu mode='horizontal' class='menu' background-color='#FFF' text-color='#1a1a1a' :router='true' @select='handleSelect'>
              <el-submenu index='1' :router='true'>
                <template slot="title" class='menu-title'><i class="fas fa-th-large"></i>{{ group.group }}</template>
                <el-menu-item class='group-item' v-for='(groupS, index) in filteredGroups' :key='groupS.id' :index='"1-"+index' :route='{path: ((group.public)?"/buildinglist/":"/dashboard/") + groupS.id}'>
                  <i class="fas fa-th-large"></i>{{ groupS.group }}
                </el-menu-item>
              </el-submenu>
              <el-submenu index='2' :router='false'>
                <template class='menu-title' slot="title"><i class="fas fa-building"></i>{{ story.name }}</template>
                <el-menu-item class='story-item' v-for='(storyS, index) in navStories' :key='storyS.id' :index='"2-"+index' :route='{path: (group.public)?`/public/${storyS.id}/1`:`/story/${storyS.id}`}'>
                  <i class="fas fa-building"></i>{{ storyS.name }}
                </el-menu-item>
              </el-submenu>
            </el-menu>
          </el-col>
          <el-col :span='4' class='buttons'>
            <el-tooltip content='Click to save story' placement='top'>
              <i class="fas fa-save" v-if='!$route.path.includes("public")' @click="$emit('save')"></i>
            </el-tooltip>
            <el-tooltip content='Click to download data' placement='top'>
              <i class="fas fa-download" @click="download()"></i>
            </el-tooltip>
          </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import { mapGetters } from 'vuex'
var JSZip = require('jszip')
var zip = new JSZip()
export default {
  name: 'navdir',
  props: ['groupContents'],
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
  computed: {
    ...mapGetters([
      'story',
      'stories'
    ])
  },
  asyncComputed: {
    groups: {
      get: function () {
        return this.$store.dispatch('stories')
      }
    }
  },
  methods: {
    download: function () {
      const map = {
        accumulated_real: 'kWh',
        real_power: 'W',
        reactive_power: 'VAR',
        apparent_power: 'VA',
        real_a: 'kW',
        real_b: 'kW',
        real_c: 'kW',
        reactive_a: 'VAR',
        reactive_b: 'VAR',
        reactive_c: 'VAR',
        pf_a: '',
        pf_b: '',
        pf_c: '',
        vphase_ab: 'V',
        vphase_bc: 'V',
        vphase_ac: 'V',
        vphase_an: 'V',
        vphase_bn: 'V',
        vphase_cn: 'V',
        cphase_a: 'A',
        cphase_b: 'A',
        cphase_c: 'A',
        cubic_feet: 'CF',
        maximum: 'CFm',
        minimum: 'CFm',
        instant: 'CFm',
        rate: 'CFm',
        total: 'lbs.',
        input: ''
      }
      let names = []
      for (let block of this.story.blocks) {
        let organizedData = [['Time']]
        for (let chart of block.charts) {
          organizedData[0].push(chart.name + ' (' + map[chart.point] + ')')
          // Consider a better way for this
          let mappedData = organizedData.slice(1, organizedData.length).map(e => { return e[0] })
          for (let point of chart.data) {
            if (mappedData.indexOf(point.x) < 0) {
              let iDate = Date.parse(point.x)
              let index = 1
              if (!organizedData[index]) {
                organizedData.splice(index, 0, [(new Date(point.x)).toString(), point.y])
                continue
              }
              while (iDate > Date.parse(organizedData[index][0])) {
                if (Date.parse(organizedData[index][0]) < iDate) {
                  break
                }
                index++
              }
              organizedData.splice(index, 0, [(new Date(point.x)).toString(), point.y])
            } else {
              organizedData[mappedData.indexOf(point.x) + 1].push(point.y)
            }
          }
        }
        for (let array of organizedData) {
          array = array.join(',')
        }
        organizedData = organizedData.join('\n')
        let name = block.name
        if (names.indexOf(name) >= 0) {
          name += '-' + block.index
        }
        zip.file(name + '.csv', organizedData)
        names.push(name)
      }
      var downloadName = this.story.name
      zip.generateAsync({ type: 'blob' }).then(function (blob) {
        let a = window.document.createElement('a')
        a.href = window.URL.createObjectURL(blob, { type: 'text/plain' })
        a.download = downloadName + '.zip'
        document.body.appendChild(a)
        a.click()
        document.body.removeChild(a)
      })
    },
    populate: function () {
      this.filteredGroups = []
      this.group = this.stories.find(p => { return p.stories.find(e => { return e.name === this.story.name }) })
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
        this.$nextTick(() => { this.$emit('update') })
      }
    }
  }
}
</script>
<style lang='scss'>
@import '@/assets/style-variables.scss';
.el-menu--horizontal > .el-submenu.is-active .el-submenu__title {
  border: none !important;
}
.el-submenu__title:hover {
  color: $--color-white !important;
  background-color: $--color-black !important;
}
.el-submenu.is-opened > .el-submenu__title{
  color: $--color-white !important;
  background-color: $--color-black !important;
}
</style>
<style scoped lang='scss'>
@import '@/assets/style-variables.scss';
  .stage {
    position: relative;
    top: 0;
    left: 0;
    height: 60px;
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
    background-color: $--color-white;
    box-shadow: 0px 2px 4px -2px rgba(0,0,0,0.5);
  }
  .menu {
    border: none;
  }

  .fas {
    color: $--color-primary !important;
    padding: 0.5em;
  }
  .el-menu-item:hover {
    color: $--color-white !important;
    background-color: $--color-black !important;
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
    color: $--color-black !important;
  }
</style>
