<template>
  <div class='background container-fluid'>
    <div class='top row' v-for='(top, tIndex) in groups' v-bind:key='tIndex'> <!-- Public and Personal dash -->
      <div class='h3 col-xs-12' data-toggle='collapse' :data-target='"#col-top-"+top.name.replace(/ /g,"_")' aria-expanded='true' :aria-controls='"col-top-"+top.name.replace(/ /g,"_")'><i class="fas fa-globe"></i>{{top.name}}</div>
      <div class='section collapse row' :id='"col-top-"+top.name.replace(/ /g,"_")'>
          <div class='category row' v-for='(section, sIndex) in top.subgroups' :key='sIndex'> <!-- education, research, etc. -->
              <div class='h4 col-xs-12' data-toggle='collapse' :data-target='"#col-sect-"+section.name.replace(/ /g,"_").replace(/&/g,"a")' aria-expanded='true' :aria-controls='"col-sect-"+section.name.replace(/ /g,"_").replace(/&/g,"a")'>  <i class="fas fa-th-large"></i>{{section.name}}</div>
              <div class='collapse row' :id='"col-sect-"+section.name.replace(/ /g,"_").replace(/&/g,"a")'>
                <div class='building col-xs-3 h5' v-for='(building, bIndex) in section.subgroups' :key="bIndex"> <!-- building -->
                  <i class="fas fa-building"></i>{{building.name}}
                </div>
              </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script>
import axios from 'axios'
export default {
  name: '',
  data () {
    return {
      groups: []
    }
  },
  created () {
    this.groups.push({name: 'Public', subgroups: []})
    axios.get(process.env.ROOT_API + 'api/getPublicGroups').then(res => {
      for (var group of res.data) {
        axios.get(process.env.ROOT_API + 'api/getGroupData?id=' + group.id).then(gd => {
          this.groups[0].subgroups.push({ name: gd.data[0][0].name, id: gd.data[0][0].id, subgroups: gd.data[1] })
        }).catch(e => {
          throw e
        })
      }
    }).catch(e => {
      console.log(e)
    })
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.background {
  position: relative;
  top: 50px;
  background-color: #424242;
  height: calc(100% - 50px);
  width: 100%;
  color: #FFF;

}
.h3 {
  border-bottom: solid 1px rgb(200,200,200);
}
.h4 {
  border-bottom: solid 1px rgb(180,180,180);
}
.h3,.h4,.h5 {
  color: rgb(26,26,26);
}
.top {
  background-color: rgb(240,240,240);
  padding: 20px;
  margin: 20px;
  border: solid 1px rgb(220,220,220);
  border-radius: 15px;
  cursor:pointer;
}
.section {
  border-radius: 15px;
  background-color: rgb(220,220,220);
  border: solid 1px rgb(200,200,200);
  padding: 20px;
  cursor: pointer;
}
.category {
  border-radius: 15px;
  background-color: rgb(200,200,200);
  border: solid 1px rgb(180,180,180);
  padding: 20px;
  margin-top: 20px;
  cursor: pointer;
}
.building {
  cursor: pointer;
}
.building:hover{
  color: #D73F09;
}
.fas {
  padding: 0.5em;
}
</style>
