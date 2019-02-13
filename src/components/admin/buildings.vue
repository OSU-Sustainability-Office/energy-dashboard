<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-11T10:22:10-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-12T14:50:28-08:00
-->

<template>
  <el-row>
    <el-col :span='24'>
      <el-row v-for='building in buildings' :key='building.id'>
        <el-col :span='24' class='groupCard'>
          <el-row>
            <el-col :span='20' class='groupTitle'>
              {{ building.group }}
            </el-col>
            <el-col :span='4' class='groupEdit'>
              <i class="fas fa-pencil-alt"></i>
            </el-col>
          </el-row>
          <el-row type='flex' class='story-flex'>
            <el-col v-for='story in building.stories' :key='story.id' :span='4' class='storyContainer'>
              <storycard :name='story.name' :media='story.media' :description='story.description' :story_id='story.id' class='storyCard' @click='buildingEdit(story)' />
            </el-col>
            <el-tooltip content="Add New Building" placement="top">
              <el-col :span='4' class='storyContainer'>
                <storycard :plus='true' :notools='1' class='storyCard' @click="openStoryEdit('', '', '', null)"/>
              </el-col>
            </el-tooltip>
          </el-row>
        </el-col>
      </el-row>
      <el-row>
        <el-col :span='24' class='groupCard addGroup'>
          <el-row>
            <el-col :span='20' class='groupTitle'>
              New Group
            </el-col>
            <el-col :span='4' class='groupEdit'>
              <i class="fas fa-plus"></i>
            </el-col>
          </el-row>
        </el-col>
      </el-row>
      <buildingEdit ref='buildingEdit' />
    </el-col>
  </el-row>
</template>

<script>
import storycard from '@/components/account/storyCard.vue'
import buildingEdit from '@/components/admin/building_edit_modal.vue'

export default {
  name: 'buildings',
  components: {
    storycard,
    buildingEdit
  },
  props: [],
  data () {
    return {
      buildings: [],
      buildingEditShow: false
    }
  },
  created () {
    this.$store.dispatch('stories').then(r => {
      this.buildings = r.filter(o => o.public)
    })
  },
  methods: {
    buildingEdit: function (building) {
      this.$refs.buildingEdit.display(building)
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.addGroup {
  padding: 1.5em;
  transition: background-color 0.5s;
}
.addGroup .groupTitle {
  transition: color 0.5s;
}
.addGroup .groupEdit {
  transition: color 0.5s;
}
.addGroup:hover {
  background-color: $--color-primary;
  cursor: pointer;
}
.addGroup:hover .groupTitle {
  color: $--color-white;
}
.addGroup:hover .groupEdit {
  color: $--color-white;
}
.groupCard {
  border: solid 2px $--color-black;
  margin: 0.2em;
  border-radius: 5px;
  box-shadow: 0px 2px 4px -2px rgba(0,0,0,0.5);
  padding-bottom: 1em;
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
.story-flex > * {
  flex: 0 0 300px;
}
.story-flex {
  overflow-x: scroll;
}
.storyContainer {
  padding: 0.5em;
}
.groupEdit {
  text-align: right;
  font-size: 28px;
  color: $--color-primary;
  padding: 0.35em;
}
.groupTitle {
  font-size: 28px;
  padding: 0.35em;
  font-family: "StratumNO2";
  color: $--color-primary;
}
</style>
