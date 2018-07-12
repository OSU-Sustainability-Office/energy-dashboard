<template>
  <div class="container-fluid">
    <div class="row">
      <div class="col" align="right">
        <label>Title</label>
      </div>
      <div class="col" align="left">
        <input type="text" name="title" ref='name' v-model='name'>
      </div>
    </div>
    <div class="row">
      <div class="col" align="right">
        <label>Sub-Title</label>
      </div>
      <div class="col" align="left">
        <input type="text" name="subtitle" ref='descr' v-model='descr'>
      </div>
    </div>
		<div class="row">
			<div class="col" align="center">
				<label>Media</label>
			</div>
		</div>
		<div class="row">
			<mediapicker ref="imagePicker"/>
		</div>
    <div class="row">
      <div class="col" align="right">
        <btn @click="discard()">Discard Changes</btn>
      </div>
      <div class='col' align="left">
        <btn @click="save()">Save Changes</btn>
      </div>
    </div>
  </div>
</template>
<script>
	import mediapicker from '@/components/account/mediapicker'
  import axios from 'axios'
  export default {
		name: 'storyEdit',
    props: [],
		data() {
			return {
				media : "",
				descr : "",
				name : "",
				storyid : 0
			}
		},
		components: {
	    mediapicker
	  },
    mounted() {

    },
		methods: {
			save: function() {
				this.$eventHub.$emit('storyCardChange',[this.storyid, this.name, this.descr,this.media]);
        var data = {
          id: this.storyid,
          media: this.media,
          descr: this.descr,
          name: this.name
        };
        axios('http://localhost:3000/api/updateStory',{method: "post",data:data, withCredentials:true}).catch(err => {
          console.log(err);
        });

			},
      discard: function() {
        this.$parent.editingStory = false;
      }
		}
  }
</script>
<style scoped>
	.row {
		padding: 0.3em;
	}
	.col {
		padding: 0.2em;
	}
	label {
		color: white;
		font-family: 'Open Sans', sans-serif;
	}
	input {
		background-color: #00000077;
		border: 1px solid #fff;
		border-radius: 5px;
		height: 2em;
		color: #fff;
	}
  .container-fluid {
    position: absolute;
    top: 250px;
    margin-left: 4em;
		margin-right: 4em;
		padding: 1.5em;
		width: calc(100% - 8em);
		background-color:  rgb(26,26,26);
		border-radius: 10px;
  }
.btn {
	color: #FFF;
	background-color: #00000077;
}
</style>
