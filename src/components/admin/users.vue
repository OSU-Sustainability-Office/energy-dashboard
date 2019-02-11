<!--
@Author: Brogan Miner <Brogan>
@Date:   2019-02-11T10:22:10-08:00
@Email:  brogan.miner@oregonstate.edu
@Last modified by:   Brogan
@Last modified time: 2019-02-11T11:54:45-08:00
-->

<template>
  <el-row>
    <el-col :span='24'>
      <el-row class='search'>
        <el-col :span='24'>
          <el-input placeholder="Search" prefix-icon="el-icon-search" v-model='search'>
          </el-input>
        </el-col>
      </el-row>
      <el-row v-for='user in allUsers' :key='user.id' class='user-row' ref="userrow" :userid='user.id'>
          <el-col :span='16'>{{ user.name }}</el-col>
          <el-col :span='8'>
            Privileges:
            <el-radio-group v-model="user.privilege" @change='updateUser(user)'>
              <el-radio-button label="1">Regular</el-radio-button>
              <el-radio-button label="2">Alerts</el-radio-button>
              <el-radio-button label="5">Admin</el-radio-button>
            </el-radio-group>
          </el-col>
      </el-row>
    </el-col>
  </el-row>
</template>

<script>
export default {
  name: 'users',
  components: {
  },
  props: [],
  data () {
    return {
      allUsers: null,
      search: ''
    }
  },
  watch: {
    search: function (v) {
      let values = this.allUsers.filter(obj => (
        // Check that the item's name includes query
        (obj.name && obj.name.toLowerCase().includes(v.toLowerCase())))
      ).map(e => {
        return e.id
      })
      for (let row of this.$refs.userrow) {
        if (values.indexOf(row.$attrs.userid) < 0) {
          row.$el.style.display = 'none'
        } else {
          row.$el.style.display = 'block'
        }
      }
    }
  },
  created () {
    this.$store.dispatch('allUsers').then(r => {
      this.allUsers = r.sort((a, b) => { return (a.name > b.name) ? 1 : -1 })
    })
  },
  methods: {
    updateUser: function (user) {
      this.$store.dispatch('updateUser', { privilege: user.privilege, id: user.id }).then(r => {
        this.$message({
          message: 'User updated successfully',
          type: 'success'
        })
      }).catch(e => {
        this.$message({
          message: 'User could not be updated',
          type: 'error'
        })
      })
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped lang='scss'>
.search {
  padding-bottom: 1em;
}
.user-row {
  padding: 0.5em;
  border: solid 1.5px darken($--color-white, 12%);
  margin: 0.2em;
  border-radius: 5px;
}

</style>
