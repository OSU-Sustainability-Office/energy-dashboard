<!--
@Author: Brogan Miner <Brogan>
@Date:   2018-12-13T17:14:29-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-24T13:13:48-08:00
-->

<template>
  <el-container class="container">
    <!-- Page Header -->
    <el-header class="header">
      <el-col :span="publicDir ? 24 : 12" class="header-col">
        <el-input v-model="search">
          <i class="el-icon-search el-input__icon" slot="prefix"></i>
        </el-input>
      </el-col>

      <el-col :span="12" class="header-col" v-if="!publicDir">
        <el-button @click="editGroup()" v-if="groups.length > 0">
          Edit Current Group
        </el-button>
        <el-button @click="newGroup()"> Create New Group </el-button>
      </el-col>
    </el-header>
    <!-- Main Page Content -->
    <el-main class="main">
      <el-tabs v-model="openName" class="tab-row">
        <el-tab-pane v-for="(item, key) in groups" :key="key" :name="key">
          <span slot="label" class="tab-label">{{ key }}</span>
          <el-row type="flex" justify="left" class="story-flex">
            <el-col
              v-for="building in item"
              :key="building.id"
              :span="4"
              class="storyContainer"
            >
              <storycard
                :name="building.name"
                :notools="publicDir !== null ? 1 : 0"
                :media="building.image"
                :description="building.types"
                class="storyCard"
                @click="$router.push({ path: `/building/${building.id}/1` })"
                ref="card"
              />
            </el-col>
            <el-col v-if="!publicDir" :span="4" class="storyContainer">
              <el-tooltip content="Create New View" placement="top">
                <storycard
                  :plus="true"
                  :notools="1"
                  class="storyCard"
                  @click="openStoryEdit('', '', '', null)"
                />
              </el-tooltip>
            </el-col>
            <!-- Add some extra padding for proper alignment, this kind of an estimated number. -->
            <el-col v-for="n in 10" :key="n" :span="4" class="blankSlate">
              &nbsp;
            </el-col>
          </el-row>
        </el-tab-pane>
      </el-tabs>
      <div class="blankGroups" v-if="groups.length === 0">
        Create a new group to add views
      </div>
    </el-main>

    <!-- Modal Views -->
    <editGroup
      ref="groupEditor"
      @save="
        (event) => {
          groupSave(event.name, event.id);
        }
      "
      @delete="
        (event) => {
          groupDelete(event.id);
        }
      "
    />
    <editStory
      ref="storyEditor"
      @save="
        (event) => {
          storySave(event.name, event.description, event.media, event.id);
        }
      "
      @delete="
        (event) => {
          deleteStory(event.id);
        }
      "
    />
  </el-container>
</template>

<script>
import storycard from '@/components/account/storyCard.vue'
import editGroup from '@/components/directory/editGroup.vue'
import editStory from '@/components/directory/editStory.vue'
import { mapGetters } from 'vuex'

export default {
  name: '',
  components: {
    storycard,
    editGroup,
    editStory
  },
  props: ['publicDir'],
  data () {
    return {
      groups: {},
      search: '',
      openName: ''
    }
  },
  watch: {
    search: function ( v ) {
      let values = this.groups
        .find( ( e ) => {
          return e.name === this.openName
        } )
        .stories.filter(
          ( story, index, arr ) =>
            // Check that the item's name includes query
            ( story.name &&
              story.name.toLowerCase().includes( v.toLowerCase() ) ) ||
            // Check that description includes query
            ( story.description &&
              story.description.toLowerCase().includes( v.toLowerCase() ) )
        )
        .map( ( e ) => {
          return e.name
        } )
      for ( let card of this.$refs.card ) {
        if ( values.indexOf( card.name ) < 0 ) {
          card.$el.parentNode.style.display = 'none'
        } else {
          card.$el.parentNode.style.display = 'block'
        }
      }
    }
  },
  computed: {
    // User should be populated due to nav-bar, only need to use the getter not the promise action
    ...mapGetters( ['user'] )
  },
  async mounted () {
    // this.$store.dispatch('stories').then(res => {
    //   let allStories = []
    //   for (let group of res) {
    //     if (group.public === this.publicDir) {
    //       let g = [].concat(group.stories)
    //       allStories = allStories.concat(g)
    //       g.sort((a, b) => { return (a.name > b.name) ? 1 : -1 })
    //       this.groups.push({ name: group.group, stories: g, id: group.id })
    //     }
    //   }
    //   if (this.publicDir) {
    //     allStories.sort((a, b) => { return (a.name > b.name) ? 1 : -1 })
    //     this.groups.splice(0, 0, {name: 'All', stories: allStories, id: 0})
    //   }
    //   if (this.groups.length > 0) {
    //     this.openName = this.groups[0].name
    //   }
    //   if (this.$route.params.group) {
    //     let name = this.groups.find(e => { return e.id === parseInt(this.$route.params.group) }).name
    //     this.openName = name
    //   }
    // })
    await this.$store.getters['map/promise']
    let buildings = this.$store.getters['map/buildings']
    for ( let building of buildings ) {
      if ( this.groups[building.group] ) {
        this.groups[building.group].push( building )
      } else {
        this.groups[building.group] = [building]
      }
    }
    this.openName = Object.keys( this.groups )[0]
    // 0: id
    this.$eventHub.$on( 'deleteStory', ( event ) => {
      this.deleteStory( event[0] )
    } )
    // 0: name, 1: description, 2: media, 3: name, 4: id
    this.$eventHub.$on( 'openStoryEdit', ( event ) => {
      this.openStoryEdit( event[0], event[1], event[2], event[3], event[4] )
    } )
  },
  methods: {
    /* GROUP EDITING AND CREATING */
    editGroup: function () {
      this.$refs.groupEditor.title = 'Edit Group'
      this.$refs.groupEditor.name = this.openName
      this.$refs.groupEditor.id = this.groups.find( ( e ) => {
        return e.name === this.openName
      } ).id
      this.$refs.groupEditor.toggle = true
    },
    groupSave: function ( name, id ) {
      if ( !id ) {
        this.groups.push( { name: name, stories: [], id: null } )
        this.openName = name
      } else {
        const g = this.groups.find( ( e ) => {
          return e.name === this.openName
        } )
        g.name = name
        this.openName = name
        this.$store.dispatch( 'updateGroup', g )
      }
    },
    groupDelete: function ( id ) {
      this.$store.dispatch( 'deleteGroup', { id: id } )
      const index = this.groups.map( ( e ) => e.id ).indexOf( id )
      this.groups.splice( index, 1 )
      this.openName = this.groups[0].name
    },
    newGroup: function () {
      this.$refs.groupEditor.name = ''
      this.$refs.groupEditor.id = null
      this.$refs.groupEditor.title = 'New Group'
      this.$refs.groupEditor.toggle = true
    },

    /* STORY EDITING AND CREATING */
    openStoryEdit: function ( name, description, media, id ) {
      const storyEditor = this.$refs.storyEditor

      storyEditor.form.name = name
      storyEditor.form.description = description
      storyEditor.form.media = media
      storyEditor.id = id
      storyEditor.title = id === null ? 'Create View' : 'Edit View'
      storyEditor.toggle = true
    },
    storySave: function ( name, description, media, id ) {
      const openGroup = this.groups.find( ( e ) => {
        return e.name === this.openName
      } )
      if ( openGroup.id ) {
        if ( id ) {
          this.$store.dispatch( 'updateStory', {
            media: media,
            description: description,
            name: name,
            id: id,
            group_id: openGroup.id
          } )
        } else {
          const story = {
            name: name,
            description: description,
            media: media,
            id: id,
            group_id: openGroup.id
          }
          openGroup.stories.push( story )
          this.$store.dispatch( 'createStory', story )
        }
      } else {
        this.$store.dispatch( 'createGroup', openGroup ).then( ( groupId ) => {
          const story = {
            name: name,
            description: description,
            media: media,
            id: id,
            group_id: groupId
          }
          openGroup.stories.push( story )
          this.$store.dispatch( 'createStory', story )
        } )
      }
    },
    deleteStory: function ( id ) {
      const openGroup = this.groups.find( ( e ) => {
        return e.name === this.openName
      } )
      const index = openGroup.stories.map( ( e ) => e.id ).indexOf( id )
      this.$store
        .dispatch( 'deleteStory', { id: id, group_id: openGroup.id } )
        .then( () => {
          openGroup.stories.splice( index, 1 )
          if ( openGroup.stories.length === 0 ) {
            this.groupDelete( openGroup.id )
          }
        } )
    }
  }
}
</script>
<style scoped lang="scss">
/*--- top level ---*/
.container {
  position: absolute;
  margin: 0;
  width: 100vw;
  padding: 0;
}

/*HEADER*/
.header {
  margin: 0;
  padding-top: 1em;
  width: 100%;
}
.header-col {
  padding: 0.5em;
}

/* MAIN */
.main {
  width: 100%;
}
/*--- Tabs   ---*/
.tab-label {
  font-size: 16px;
}

/*--- Flex Box   ---*/
.story-flex {
  flex-wrap: wrap !important;
  overflow-x: hidden;
}
.story-flex > * {
  flex-grow: 1;
  flex-shrink: 1;
  flex-basis: 0;
  min-width: 300px;
}

/*--- Cards   ---*/
.storyContainer {
  padding: 0.5em;
}
.storyCard {
  margin: auto;
  cursor: pointer;
}
.storyCard:hover {
  border-color: $--color-primary;
  outline: solid 3px $--color-primary;
  outline-offset: -5px;
}
.blankSlate {
  padding-right: 0.5em;
  padding-left: 0.5em;
}
.blankGroups {
  font-size: 22px;
  position: relative;
  top: 1em;
  width: 100%;
  text-align: center;
}
</style>
