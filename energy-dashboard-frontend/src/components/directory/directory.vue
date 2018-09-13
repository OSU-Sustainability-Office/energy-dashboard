<template>
  <div class='container-fluid'>
    <!-- <navdir ref='navdir' class="bar"/> -->
    <b-tabs nav-class="directory-tabs" v-model='mainGroup'>
      <b-tab title='Public' :key='0'>
        <b-tabs class='mainArea' pills nav-class='directory-group-tab' v-model='openPublicTab'>
          <b-tab class='cotainer' title='All'>
            <div class="row padded" >
              <div class='col-xl-3 col-lg-4 col-md-6' v-for='(building, index_b) in allStories()' :key='index_b' >
                <storycard :name='building.name' :notools='true' :media='building.media' :description='building.description' class="mx-auto storyCard" @click='$router.push({path: `/public/${building.id}/1`})' ref='card'/>
              </div>
            </div>
          </b-tab>
          <b-tab class="container" v-for='(item, index) in subGroupsForPath(0)' :key='index' :title='item.name' ref='group'>
            <div class="row padded" >
              <div class='col-xl-3 col-lg-4 col-md-6' v-for='(building, index_b) in item.subgroups' :key='index_b' >
                <storycard :name='building.name' :notools='true' :media='building.media' :description='building.description' class="mx-auto storyCard" @click='$router.push({path: `/public/${building.id}/1`})' ref='card'/>
              </div>
            </div>
          </b-tab>
        </b-tabs>
        <div class='searchArea'>
          <el-input v-model='search'>
            <i class="el-icon-search el-input__icon" slot="prefix"></i>
          </el-input>

        </div>
      </b-tab>
      <b-tab title='Your Dashboard' v-if='user.name !== ""' :key='1'>
        <b-tabs pills :nav-class="['directory-group-tab']" v-model='openUserTab'>
          <b-tab class="container" v-for='(item, index) in subGroupsForPath(1)' :key='index' :title='item.name'>
            <div class="row padded" >
              <div class='col-xl-3 col-lg-4 col-md-6' v-for='(building, index_b) in item.subgroups' :key='index_b' >
                <storycard :name='building.name' :media='building.media' :description='building.description' class="mx-auto storyCard" @click='$router.push({path: `/dashboard/${building.id}`})' :group='index' :index='index_b'/>
              </div>
              <div class='col-xl-3 col-lg-4 col-md-6'>
                <storycard class='mx-auto' :plus='true' @click='newStory(index)' :notools='true' v-b-tooltip.hover title='Create a Story' />
              </div>
            </div>
          </b-tab>
          <b-nav-item slot='tabs' class="tab plus" @click.prevent='newTab()'>
            +
          </b-nav-item>
          <div slot="empty" class="text-center text-muted">
            Click the '+' to create a group
          </div>
        </b-tabs>
        <div class='editgroup'>
          <b-btn @click='openGroupEdit()'>Edit Group</b-btn>
          <b-modal v-model='groupedit' title="Edit Group" body-bg-variant="light" header-bg-variant="light" footer-bg-variant="light">
            <b-container>
              <div class="row">
                <label>Name:</label>
                <el-input type="text" v-model='tempGroupName'>New Group</el-input>
              </div>
            </b-container>
            <b-container slot='modal-footer'>
              <div class='row'>
                <div class='col-6'>
                  <b-btn @click='groupSave()' variant='primary'> Ok </b-btn>
                  <b-btn @click='groupedit = false'> Cancel </b-btn>
                </div>
                <div class='col text-right'>
                  <b-btn @click='groupDelete(openUserTab)' variant='danger'> Delete </b-btn>
                </div>
              </div>
            </b-container>
          </b-modal>
        </div>
      </b-tab>
    </b-tabs>
  </div>
</template>

<script>
import navdir from '@/components/account/navdir.vue'
import storycard from '@/components/account/storyCard.vue'
import { mapGetters } from 'vuex'

export default {
  name: '',
  components: {
    navdir,
    storycard
  },
  data () {
    return {
      groups: [],
      path: ['Public'],
      currentGroups: [],
      groupedit: false,
      tempGroupName: '',
      openUserTab: 0,
      openPublicTab: 0,
      mainGroup: 0,
      search: ''
    }
  },
  watch: {
    search: function (v) {
      let values = this.allStories().filter((story, index, arr) => (
        // Check that the item's name includes query
        (story.name && story.name.toLowerCase().includes(v.toLowerCase())) ||
        // Check that description includes query
        (story.description && story.description.toLowerCase().includes(v.toLowerCase()))
      )).map(e => {
        return e.name
      })
      for (let card of this.$refs.card) {
        if (values.indexOf(card.name) < 0) {
          card.$el.parentNode.style.display = 'none'
        } else {
          card.$el.parentNode.style.display = 'block'
        }
      }
    }
  },
  computed: {
    // User should be populated due to nav-bar, only need to use the getter not the promise action
    ...mapGetters([
      'user'
    ])
  },
  created () {
    this.groups.push({name: 'Public', subgroups: []})
    this.groups.push({name: 'Your Dashboard', subgroups: []})
    this.$store.dispatch('stories').then(res => {
      for (let group of res) {
        let g = [].concat(group.stories)
        g.sort((a, b) => { return a.name > b.name })
        if (group.public) {
          this.groups[0].subgroups.push({ name: group.group, subgroups: g, id: group.id })
        } else {
          this.groups[1].subgroups.push({ name: group.group, subgroups: g, id: group.id })
        }
      }
      if (this.$route.path.search('private') > 0) {
        this.mainGroup = 1
      } else {
        this.mainGroup = 0
      }
      this.groups[0].subgroups.sort((a, b) => { return a.name > b.name })
      this.groups[1].subgroups.sort((a, b) => { return a.name > b.name })
      this.$nextTick(() => {
        if (this.$route.params.group) {
          let i = this.groups[this.mainGroup].subgroups.map(e => { return e.id }).indexOf(parseInt(this.$route.params.group))
          if (this.$route.path.search('private') > 0) {
            this.openUserTab = i + 1
          } else {
            this.openPublicTab = i + 1
          }
        }
      })
    })
    // 0: group, 1: index, 2: id
    this.$eventHub.$on('deleteStory', (event) => { this.deleteStory(event[2], event[0], event[1]) })
    // 0: group, 1: index, 2: name, 3: description, 4: media
    this.$eventHub.$on('updateStory', (event) => { this.updateStory(event[0], event[1], event[2], event[3], event[4]) })

    this.$eventHub.$on('updateDirectoryListings', (event) => {
      if (event[0] > 0) {
        this.mainGroup = 1
      } else {
        this.mainGroup = 0
      }
    })
  },
  methods: {
    allStories: function () {
      let r = []
      for (let g of this.groups[0].subgroups) {
        r = r.concat(g.subgroups)
      }
      r.sort((a, b) => { return a.name > b.name })
      return r
    },
    openGroupEdit: function () {
      this.groupedit = true
      this.tempGroupName = this.groups[1].subgroups[this.openUserTab].name
    },
    groupSave: function () {
      this.groups[1].subgroups[this.openUserTab].name = this.tempGroupName
      this.groupedit = false
      this.$store.dispatch('updateGroup', this.groups[1].subgroups[this.openUserTab])
    },
    groupDelete: function (index) {
      this.$store.dispatch('deleteGroup', { id: this.groups[1].subgroups[index].id })
      this.groups[1].subgroups.splice(index, 1)
      this.openUserTab = 0
      this.groupedit = false
    },
    newTab: function () {
      this.groups[1].subgroups.push({ name: 'New Group', subgroups: [], id: null })
    },
    newStory: function (groupIndex) {
      let promise = []
      if (!this.groups[1].subgroups[groupIndex].id) {
        promise.push(this.$store.dispatch('createGroup', this.groups[1].subgroups[groupIndex]))
      }
      // Vue cannot detect the addition of new properties, make sure all properties that are editable are present in the initialization
      Promise.all(promise).then((r) => {
        let newStory = { name: 'New Story', description: 'description', media: '', id: null, group_id: this.groups[1].subgroups[groupIndex].id }
        this.groups[1].subgroups[groupIndex].subgroups.push(newStory)

        this.$store.dispatch('createStory', newStory)
      })
    },
    updateStory: function (group, index, name, description, media) {
      if (!this.groups[1].subgroups[group]) {
        return
      }
      this.groups[1].subgroups[group].subgroups[index].media = media
      this.groups[1].subgroups[group].subgroups[index].name = name
      this.groups[1].subgroups[group].subgroups[index].description = description

      this.$store.dispatch('updateStory', this.groups[1].subgroups[group].subgroups[index])
    },
    deleteStory: function (id, group, index) {
      if (!this.groups[1].subgroups[group]) {
        return
      }
      this.$store.dispatch('deleteStory', { id: this.groups[1].subgroups[group].subgroups[index].id, group_id: this.groups[1].subgroups[group].id }).then(() => {
        if (this.groups[1].subgroups[group].subgroups.length === 0) {
          this.groupDelete(group)
        }
      })
      this.groups[1].subgroups[group].subgroups.splice(index, 1)
    },
    subGroupsForPath: function (r) {
      return this.groups[r].subgroups
    },
    pushItem: function (item) {
      for (let section of this.subGroupsForPath()) {
        if (section !== item) {
          section.open = false
        }
      }
      item.open = !item.open
      if (this.path.length > 1) {
        this.path.pop()
      }
      if (item.open) {
        this.path.push(item.name)
      }
    }
  }
}
</script>
<style>
.directory-tabs {
  display: none;
}
.directory-group-tab {
  border-bottom: solid 1px rgba(0,0,0,0.1);
  padding: 0.5em;
}
.directory-tabs .nav-item > a {
  color: rgb(215,63,9) !important;
  font-size: 1.4em !important;
}
.directory-group-tab.short {
  width: 90%;
}
.directory-group-tab .nav-item > a {
  color: #000 !important;
}
.directory-group-tab .nav-item:hover :not(.active) {
  color: #FFF !important;
  background-color: rgb(26,26,26) !important;
}
.directory-group-tab .nav-item .active {
  color: #FFF !important;
  background-color: rgb(215,63,9) !important;
}
</style>
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mainArea {
  margin-top: 1em;

}
.h3 {
  border-bottom: solid 1px rgba(126,126,126,0.2);
  padding-bottom: 0.4em;
  font-family: "Open Sans", sans-serif;
  background-color: rgb(26,26,26);
  width: 100%;
  padding: 0.5em;
  color: #FFF;
  box-shadow: 0px 2px 4px -2px rgba(0,0,0,0.5);
  cursor: pointer;
}
.open {
  background-color: rgb(215,63,9) !important;
}
.h3:hover {
  background-color: rgb(215,63,9);
}
.h3:active {
  background-color: #d76740;
}
.padded {
  padding: 2em;
}
.section {
  border-radius: 10px;
  overflow: hidden;
  background-color: rgb(240,240,240);
  background: linear-gradient(180deg, rgb(240,240,240) 92%,rgb(190,190,190) 100%);
  color: #000;
  padding-bottom: 10px;
  margin-top: -10px;
  /* border: solid 1px rgb(126,126,126); */
}
.storyCard {
  cursor: pointer;
}
.storyCard:hover {
  border: solid 3px rgb(215,63,9);
}
.plus {
  font-weight: bold;
  font-size: 1.5em;
  line-height: 1.125em;
  color: rgb(215,63,9);
}
.plus a {
    color: rgb(215,63,9);
}
.storyCard:active {
  border: solid 3px #FFF;
}
.editgroup {
  position: absolute;
  top: 4.8em;
  right: 2em;
}
.searchArea {
  position: absolute;
  top: 5.1em;
  right: 2em;
}
</style>
