<template>
  <div class='bar container-fluid'>
    <div class='row main align-items-center'>
      <el-dropdown v-for='(item, index) in path' v-if='index > 0' :key='index' :id='"dropdown-" + index' class="itm col" placement='bottom-start' @command='(a)=>{moveRoute(a[0], a[1])}'>
        <div class=''>
          <div class='leftP'>
            <i :class="getClass(item,index)"></i>
          </div>
          <div class='it'>{{ item }}</div>
          <div class='rightP'>
            <i class="fas fa-caret-down"></i>
          </div>
        </div>
        <el-dropdown-menu slot='dropdown'>
          <el-dropdown-item v-for='(otherStory, index_o) in getDataForPathIndex(index)' :key='index_o' class='col' :command='[index, index_o]'>
            <i :class='getClass(otherStory,index)'></i>
            {{ otherStory }}
          </el-dropdown-item>
        </el-dropdown-menu>
      </el-dropdown>
      <div class='col text-right'>
        <i class="fas fa-save dButton" v-b-tooltip.hover title='Save Story Charts' v-if='path[0] === "Your Dashboard"' @click="$parent.save()"></i>
        <i class="fas fa-download dButton" v-b-tooltip.hover title='Download Story Data' @click="download()"></i>
      </div>
    </div>
  </div>
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
      path: []
    }
  },
  computed: {
    ...mapGetters([
      'story',
      'stories'
    ])
  },
  watch: {
    story: {
      handler: function (v) {
        // This is kind of expensive consider changing at some point
        const group = this.stories.find(p => { return p.stories.find(e => { return e.name === this.story.name }) })
        if (!group) {
          return
        }
        if (!group.public) {
          this.path = ['Your Dashboard']
        } else {
          this.path = ['Public']
        }

        this.path.push(group.group)
        this.path.push(this.story.name)
      }
    }

  },
  mounted () {
    // This is kind of expensive consider changing at some point
    const group = this.stories.find(p => { return p.stories.find(e => { return e.name === this.story.name }) })
    if (group) {
      if (!group.public) {
        this.path = ['Your Dashboard']
      } else {
        this.path = ['Public']
      }

      this.path.push(group.group)
      this.path.push(this.story.name)
    }
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
<style scoped>
  .el-dropdown-menu__item {
    width: 350px;
  }
  .bar {
    position: absolute;
    left: 0px;
    height: 40px;
    z-index: 10;
    box-shadow: 0px 2px 4px -2px rgba(0,0,0,0.5);
  }
  .row.main {
    position: absolute;
    left: 1%;
    white-space: nowrap;
    height: 100%;
    width: 100%;
  }
  .itm {
    background-color: #FFF;
    height: 100%;
    border-right: solid 2px rgb(226,226,226);
    /* clip-path:polygon(0 0, calc(100% - 15px) 0, 100% 50%, calc(100% - 15px) 100%, 0 100%, 15px 50%); */
    color: rgb(26,26,26);
    cursor: pointer;
  }
  .itm-end {
    background-color: #FFF;
    display: inline-block;
    margin-left: -17px;
    height: 100%;
    clip-path:polygon(0 0, 100% 0, 100% 100%, 0 100%, 15px 50%);
    color: rgb(26,26,26);
    cursor: pointer;
  }
  .itm:hover {
    background-color: #D73F09;
    color: #FFF;
  }
  .leftP {
    display: inline-block;
    position: absolute;
    left: 20px;
    top: 0px;
    padding-top: 7px;
    color: #D73F09;
  }
  .rightP {
    display: inline-block;
    position: absolute;
    right: 20px;
    top: 0px;
    width: 10px;
    padding-top: 7px;
    color: #D73F09;
  }
  .it {
    text-overflow: ellipsis;
    display: inline-block;
    color: #000;
    padding-left: 36px;
    padding-top: 5px;
    font-size: 16px;
  }
  .col-3.itm > .row > .col.it {
    padding-top: 10px;
  }
  .fas {
    font-size: 1.5em;
  }
  .itm:hover .leftP {
    color: #FFF;
  }
  .itm:hover .rightP {
    color: #FFF;
  }
  .dropdown-toggle {
    width: 100%;
    height: 100%;
  }
  .selector {
    width: 250px;
    margin: 10px;
  }

  .selector .title{
    text-overflow: ellipsis;
    cursor: pointer;
    width: 100%;
    height: 100%;
  }
  .selector .title:hover {
    color: #D73F09;
  }
  .title {
    height: 30px !important;
    font-size: 1.2em !important;
    font-family: 'Open Sans', sans-serif !important;
  }
  .dButton {
    cursor: pointer;
    color: #D73F09;
    padding-right: 0.4em;
  }
  .dButton:hover {
    color: #000;
  }

</style>
