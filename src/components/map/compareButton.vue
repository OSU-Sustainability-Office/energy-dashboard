<template>
  <button class="bigButton" @click="$emit('startCompare')">Compare Buildings</button>
</template>

<script>
export default {
  name: 'compareButton',
  props: {},
  components: {}
}
</script>
<style scoped lang="scss">
.bigButton {
  font-family: 'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial,
    sans-serif;
  display: flex;
  align-items: center;
  position: absolute;
  top: 78px;
  left: 10px;
  width: 170px;
  height: 40px;
  background-color: white;
  border: 2px solid rgba(0, 0, 0, 0.2);
  background-clip: padding-box;
  border-radius: 4.5px;
  opacity: 1;
  justify-content: center;
  z-index: 500;
  cursor: pointer;
  font-size: 15px;
}
</style>
