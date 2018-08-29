<template>
  <div class='container-fluid'>
    <!-- <navdir ref='navdir' class="bar"/> -->
    <b-tabs nav-wrapper-class="w-100">
      <b-tab title='Public' title-link-class=''>
        <b-tabs pills card>
          <b-tab class="container" v-for='(item, index) in subGroupsForPath(0)' :key='index' :title='item.name'>
            <div class="row justify-content-start padded" >
              <div class='col' v-for='(building, index_b) in item.subgroups' :key='index_b' @click='$router.push({path: `/public/${building.id}/1`})'>
                <storycard :name='building.name' :notools='true' :media='building.media' :description='building.description' class="storyCard" />
              </div>
            </div>
          </b-tab>
        </b-tabs>
      </b-tab>
      <b-tab title='Your Dashboard' v-if='user.name !== ""'>
        <b-tabs pills card>
          <b-tab class="container" v-for='(item, index) in subGroupsForPath(1)' :key='index' :title='item.name'>
            <div class="row justify-content-start padded" >
              <div class='col' v-for='(building, index_b) in item.subgroups' :key='index_b' @click='$router.push({path: `/dashboard/${building.id}`})'>
                <storycard :name='building.name' :media='building.media' :description='building.description' class="storyCard" />
              </div>
              <div class='col'  @click='newStory(index)'>
                <storycard :plus='true' :notools='true' v-b-tooltip.hover title='Create a Story' />
              </div>
            </div>
          </b-tab>
          <b-nav-item slot='tabs' class="container" @click.prevent='newTab()'>
            +
          </b-nav-item>
          <div slot="empty" class="text-center text-muted">
            Click the '+' to create a group
          </div>
        </b-tabs>
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
      currentGroups: []
    }
  },
  computed: {
    // User should be populated due to nav-bar, only need to use the getter not the promise action
    ...mapGetters([
      'user'
    ])
  },
  mounted () {
  },
  created () {
    this.groups.push({name: 'Public', subgroups: []})
    this.groups.push({name: 'Your Dashboard', subgroups: []})
    this.$store.dispatch('stories').then(res => {
      for (let group of res) {
        if (group.public) {
          this.groups[0].subgroups.push({ name: group.group, subgroups: group.stories, open: this.path.includes(group.group) })
        } else {
          this.groups[1].subgroups.push({ name: group.group, subgroups: group.stories, open: this.path.includes(group.group) })
        }
      }
    })

    if (this.$route.params.group) {
      this.path.push(this.$route.params.group)
    }
  },
  methods: {
    newTab: function () {
      this.groups[1].subgroups.push({ name: 'New Group', subgroups: [] })
    },
    newStory: function (groupIndex) {
      this.groups[1].subgroups[groupIndex].subgroups.push({ name: 'New Story', description: 'description' })
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
<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.mainArea {
  position: absolute;
  left: 0px;
  width: 100%;
  border-radius: 10px;
  margin-top: 8em;
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

.storyCard:active {
  border: solid 3px #FFF;
}
</style>
