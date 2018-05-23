<template>
  <div class="card" v-bind:class="{ feature : isFeatured }">
    {{this.title}}, {{this.desc}} {{this.isFeatured}}
  </div>
</template>

<script>

export default {
  name: 'card',
  props: ['title', 'desc', 'featured'],
  data () {
    return {
      title: this.title,
      desc: this.desc,
      isFeatured: this.featured
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
  margin-right: 1em;
  margin-top: 1em;
  border: 2px solid #000;
  border-radius: 5px;
  height: 15em;
  min-width: 15em;
}
.feature {
  background: #000;
  height: 23em;
  min-width: 23em;
}
</style>
