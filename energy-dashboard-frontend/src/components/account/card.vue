<template>
  <div class="card">
    {{this.title}}, {{this.desc}}
  </div>
</template>

<script>

export default {
  name: 'card',
  props: ['title', 'desc'],
  data () {
    return {
      title: this.cardData.title,
      desc: this.cardData.desc
    }
  }
}
</script>

<!-- Add "scoped" attribute to limit CSS to this component only -->
<style scoped>
.card {
  margin-right: 1em;
  border: 3px solid #000;
  height: 15em;
  min-width: 15em;
}
</style>
