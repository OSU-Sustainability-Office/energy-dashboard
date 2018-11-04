<template>
  <el-container class='stage'>
    <el-main class='main'>
        <el-row class='bar'>
          <el-col :span='20'>
            <el-menu mode='horizontal' class='menu' background-color='#00000000' text-color='#000'>
              <el-submenu index='1'>
                <template slot="title">{{ group.group }}</template>
                <el-menu-item v-for='(group, index) in filteredGroups' :key='group.id' :index='""+index'>
                  {{ group.group }}
                </el-menu-item>
              </el-submenu>
              <el-submenu index='2'>
                <template slot="title">{{ story.name }}</template>
                <el-menu-item v-for='(storyS, index) in navStories' :key='storyS.id' :index='""+index'>
                  {{ storyS.name }}
                </el-menu-item>
              </el-submenu>
            </el-menu>
          </el-col>
          <el-col :span='4'>
            <i class="fas fa-save dButton" v-b-tooltip.hover title='Save Story Charts' v-if='path[0] === "Your Dashboard"' @click="$parent.save()"></i>
            <i class="fas fa-download dButton" v-b-tooltip.hover title='Download Story Data' @click="download()"></i>
          </el-col>
      </el-row>
    </el-main>
  </el-container>
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
      path: [],
      filteredGroups: [],
      navStories: []
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'stories'
    ]),
    group: {
      get: function () {
        return this.stories.find(p => { return p.stories.find(e => { return e.name === this.story.name }) })
      }
    }
  },
  watch: {
    story: {
      handler: function (v) {
        // This is kind of expensive consider changing at some point
        // const group = this.stories.find(p => { return p.stories.find(e => { return e.name === this.story.name }) })
        // if (!group) {
        //   return
        // }
        // if (!group.public) {
        //   this.path = ['Your Dashboard']
        // } else {
        //   this.path = ['Public']
        // }
        //
        // this.path.push(group.group)
        // this.path.push(this.story.name)
      }
    }

  },
  mounted () {
    // This is kind of expensive consider changing at some point
    this.$nextTick(() => {
      console.log(this.stories)
    })
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
      let names = []
      for (let block of this.story.blocks) {
        let organizedData = [['Time']]
        for (let chart of block.charts) {
          organizedData[0].push(chart.name)
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
    getClass: function (name, index) {
      if (index === 0) {
        if (name === 'Public') {
          return 'fas fa-globe'
        } else {
          return 'fas fa-user'
        }
      } else if (index === 1) {
        return 'fas fa-th-large'
      } else {
        return 'fas fa-building'
      }
    },
    getDataForPathIndex: function (i) {
      if (i === 0) {
        return ['Public', 'Your Dashboard']
      } else if (i === 1) {
        let r = []
        if (!this.groups) {
          return
        }
        const cGroup = this.stories.find(p => { return p.stories.find(e => { return e.name === this.story.name }) })
        if (!cGroup) {
          return
        }
        for (let group of this.groups) {
          // Cant be === because public is undefined if not true
          if ((!cGroup.public && !group.public) || (cGroup.public && group.public)) {
            r.push(group.group)
          }
        }
        return r
      } else if (i === 2) {
        let r = []
        if (!this.groups) {
          return
        }
        for (let story of this.groups.find(elm => elm.group === this.path[1]).stories) { r.push(story.name) }
        return r
      } else {
        return ['Error']
      }
    },
    moveRoute: function (dirI, dropI) {
      if (dirI === 0) {
        if (dropI === 0) {
          this.$router.push({ path: `/buildinglist/` })
        } else {
          this.$router.push({ path: `/dashboard/` })
        }
      } if (dirI === 1) {
        const group = this.stories.find(p => { return p.stories.find(e => { return e.name === this.story.name }) })
        if (!group.public) {
          let p = 0
          while (1) { if (this.groups[p].public) { p++ } else { break } }
          dropI += p
          this.$router.push({ path: `/dashboard/${this.groups[dropI].id}` })
        } else {
          this.$router.push({ path: `/buildinglist/${this.groups[dropI].id}` })
        }
      } else if (dirI === 2) {
        const group = this.stories.find(p => { return p.stories.find(e => { return e.name === this.story.name }) })
        if (!group.public) {
          this.$router.push({ path: `/dashboard/${this.groups.find(elm => elm.group === this.path[1]).stories[dropI].id}/` })
        } else {
          this.$router.push({ path: `/public/${this.groups.find(elm => elm.group === this.path[1]).stories[dropI].id}/1` })
        }
        // this.$parent.changeStory([this.groups.find(elm => elm.group === this.path[1]).stories[dropI].id, 0])
        this.$parent.update()
      }
    }
  }
}
</script>
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
</style>
