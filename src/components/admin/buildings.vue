<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-11T10:22:10-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-11T12:49:00-08:00
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
              <storycard :name='story.name' :media='story.media' :description='story.description' :story_id='story.id' class='storyCard' />
            </el-col>
            <el-tooltip content="Create New View" placement="top">
              <storycard :plus='true' :notools='1' class='storyCard' @click="openStoryEdit('', '', '', null)"/>
            </el-tooltip>
          </el-row>
        </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
import storycard from '@/components/account/storyCard.vue'

export default {
  name: 'buildings',
  components: {
    storycard
  },
  props: [],
  data () {
    return {
      buildings: []
    }
  },
  created () {
    this.$store.dispatch('stories').then(r => {
      this.buildings = r.filter(o => o.public)
    })
  },
  methods: {

  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
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
