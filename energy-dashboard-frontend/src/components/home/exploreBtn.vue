<template>
  <a href="/#/story/default">
    <div id="explore-button">
      <b>Explore Energy at Oregon State</b>
    </div>
  </a>
</template>

<script>
export default {
  name: 'exploreBtn'
}
</script>

<style>
#explore-button {
  position: absolute;
  color: #fff;
  padding: .25em;
  font-size: 2em;
  text-align: center;
  border: 2px solid #fff;
  top: 66%;
  max-width: 30%;
  margin: auto;
  left: 0;
  right: 0;
}
#explore-button:hover {
  background: rgba(0,0,0,.7);
  cursor: pointer;
}
</style>
