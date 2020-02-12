/*
 * @Author: you@you.you
 * @Date:   Tuesday December 17th 2019
 * @Last Modified By:  Brogan Miner
 * @Last Modified Time:  Tuesday December 17th 2019
 * @Copyright:  (c) Oregon State University 2019
 */
<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-17T14:07:35-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-01-29T12:43:12-08:00
-->

<template>
  <el-row class='stage'>
    <el-col class='main'>
        <el-row class='bar'>
          <el-col :span='20'>
            <el-menu mode='horizontal' class='menu' background-color='#FFF' text-color='#1a1a1a' :router='true' @select='handleSelect'>
              <el-submenu index='1' :router='true'>
                <template slot="title" class='menu-title'><i class="fas fa-th-large"></i>{{ group1Name }}</template>
                <el-menu-item class='group-item' v-for='(groupS, index) in group1' :key='groupS.id' :index='"1-"+index' :route='{path: ((publicView)?"/buildings/":"/view/") + groupS.id}'>
                  <i class="fas fa-th-large"></i>{{ groupS.name }}
                </el-menu-item>
              </el-submenu>
              <el-submenu index='2' :router='false' v-if='publicView'>
                <template class='menu-title' slot="title"><i class="fas fa-building"></i>{{ group2Name }}</template>
                <el-menu-item class='story-item' v-for='(storyS, index) in group2' :key='storyS.id' :index='"2-"+index' :route='{ path: `/building/${storyS.id}/1` }'>
                  <i class="fas fa-building"></i>{{ storyS.name }}
                </el-menu-item>
              </el-submenu>
            </el-menu>
          </el-col>
          <!-- <el-col :span='4' class='buttons'>
            <el-tooltip content='Click to copy share link'>
              <i class="fas fa-share-square" @click='copyUrl()'></i>
            </el-tooltip>
            <el-tooltip content='Click to save story' placement='top'>
              <i class="fas fa-save" v-if='story.user_id === user.id' @click="$emit('save')"></i>
            </el-tooltip>
            <el-tooltip content='Click to download data' placement='top'>
              <i class="fas fa-download" @click="download()"></i>
            </el-tooltip>
          </el-col> -->
      </el-row>
    </el-col>
  </el-row>
</template>

<script>

var JSZip = require('jszip')
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
  mounted () {
    this.update()
  },
  computed: {
    viewOrBuilding: {
      get () {
        if (this.publicView) {
          return this.$store.getters['map/building'](this.$route.params.id)
        } else {
          let view = this.$store.getters['user/view'](this.$route.params.id)
          if (!view) view = this.$store.getters['view']
          return view
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
          return this.$store.getters['user/views']
        }
      }
    },
    group2: {
      get () {
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
        if (this.publicView) {
          return this.viewOrBuilding.group
        } else {
          return this.viewOrBuilding.name
        }
      }
    },
    group2Name: {
      get () {
        return this.viewOrBuilding.name
      }
    },
    publicView: {
      get () {
        return this.$route.path.includes('building')
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
      let zip = new JSZip()
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
            let iDate = new Date(point.x)

            if (mappedData.indexOf(iDate.toString()) < 0) {
              let index = 1
              if (!organizedData[index]) {
                organizedData.splice(index, 0, [iDate.toString(), point.y])
                continue
              }
              while (iDate > Date.parse(organizedData[index][0])) {
                if (Date.parse(organizedData[index][0]) < iDate) {
                  break
                }
                index++
              }
              organizedData.splice(index, 0, [iDate.toString(), point.y])
            } else {
              organizedData[mappedData.indexOf(iDate.toString()) + 1].push(point.y)
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
    background-color: $--color-white;
    box-shadow: 0px 2px 4px -2px rgba(0,0,0,0.5);
  }
  .menu {
    margin: 0;
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
