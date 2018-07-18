<template>
  <div class="stage">
    <div class="section users">
      Users
      <div v-for="user in users" :id='user.id' :name='user.name' :privilige='user.privilege'>
        Id: {{user.id}}
        Name: <input class="form-control" type="text" :value='user.name'>
        Privilege: <input class="form-control" type="text" :value='user.privilege'>
        <btn @click="saveUser">Save</btn>
        <btn @click="deleteUser">Delete</btn>
      </div>
      <btn @click="newUser">New User</btn>
    </div>
    <div class="section meterGroups">
      Meter Groups
      <div v-for="(meterGroup, index) in meterGroups" :id='meterGroup.id' :name='meterGroup.name' :building='meterGroup.is_building' class="meterGroup">
        Id: {{meterGroup.id}}
        Name: <input class="form-control" type="text" v-model='meterGroup.name'>
        Building: <input type="checkbox" :checked='meterGroup.is_building' v-model='meterGroup.is_building' value=1>
        Meters:
        <div v-for="(meter,index) in meterGroup.meters" class="meterControl">
          <select ref="meters" class="form-control" v-model=meter.id>
            <option v-for="meterAll in meters" :value='meterAll.id'>
              {{meterAll.name}}
            </option>
          </select>
          <select class="form-control" v-model='meter.operation'>
            <option value=1>+</option>
            <option value=0>-</option>
          </select>
          <btn @click="deleteMeter(meterGroup,index)">Delete Meter</btn>
        </div>
        <btn @click="addMeter(meterGroup)">Add Meter</btn>
        <btn @click="saveMeterGroup(index)">Save</btn>
        <btn @click="deleteMeterGroup(index)">Delete</btn>
      </div>
      <btn @click="newMeterGroup()">New Group</btn>
    </div>
  </div>
</template>

<script>

import axios from 'axios';

export default {
  name: 'admin',
  components: {
  },
  props: [],
  data() {
    return {
      users: [],
      blocks: [],
      stories: [],
      meterGroups: [],
      meters: []
    }
  },
  created() {
    axios.get(process.env.ROOT_API+'api/getAllUsers').then (res => {
      this.users = res.data;
    });
    axios.get(process.env.ROOT_API+'api/getAllMeterGroups').then (res => {
      var promises = [];
      for (var i = 0; i < res.data.length; i++) {
        promises.push(axios.get(process.env.ROOT_API+'api/getMetersForGroup?id='+res.data[i].id));
      }
      Promise.all(promises).then(values => {
        for (var i = 0; i < values.length; i++) {
          res.data[i]['meters'] = values[i].data;
          this.meterGroups.push(res.data[i]);
        }
        console.log(this.meterGroups);
      });

    });
    axios.get(process.env.ROOT_API+'api/getDefaultMeters').then (res => {
      this.meters = res.data;
    });
  },
  methods: {
    newUser: function() {
      this.users.push({id: null, name:"", privilege: 0});
    },
    saveUser: function() {

    },
    deleteUser: function() {

    },
    saveMeterGroup: function(group) {
      //console.log(this.meterGroups[group]);
      this.meterGroups[group]['user_id'] = 1;
      if (this.meterGroups[group].is_building) {
        this.meterGroups[group].is_building = 1;
      }
      else {
        this.meterGroups[group].is_building = 0;
      }
      console.log(this.meterGroups[group]);
      axios.post(process.env.ROOT_API+'api/updateMeterGroup', this.meterGroups[group]).then (res => {
        console.log(res);
      });

    },
    newMeterGroup: function() {
      this.meterGroups.push({meters:[]});

    },
    deleteMeterGroup: function(group) {

      this.meterGroups.splice(group,1);

      //todo send delete to api
    },
    deleteMeter: function(group,meter) {
      group.meters.splice(meter,1);
    },
    addMeter: function(group) {
      group.meters.push({});
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.meterControl {
}
.meterGroup {
  padding-bottom: 1em;
}
.stage {
  padding: 1em;
}
.form-control {
  display: inline;
  width: 200px;
}
.section {
  padding-bottom: 2em;
}

</style>
