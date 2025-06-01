<!--
  Filename: BuildingMenuButton.vue
  Info: Building menu button to show/hide the building menu on the left side of the screen.
-->
<template>
  <div>
    <button @click="toggleFlag" class="toggleButton">{{ buttonText }}</button>
  </div>
</template>

<script>
import emitter from '../../event-bus'

export default {
  name: 'BuildingMenuButton',
  data() {
    return {
      flag: true,
      flag2: false
    }
  },
  computed: {
    isSmallScreen() {
      return window.innerWidth < 844 // Adjust this threshold as needed
    },
    buttonText() {
      return this.isSmallScreen
        ? this.flag2
          ? 'Hide Building Menu'
          : 'Show Building Menu'
        : this.flag
          ? 'Hide Building Menu'
          : 'Show Building Menu'
    }
  },
  methods: {
    toggleFlag: function () {
      if (this.isSmallScreen) {
        this.flag2 = !this.flag2
        emitter.emit('inputData', this.flag2)
      } else {
        this.flag = !this.flag
        emitter.emit('inputData', this.flag)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.toggleButton {
  cursor: pointer;
  font-size: 15px;
  background-color: white;
  font-family:
    'Helvetica Neue', Helvetica, 'PingFang SC', 'Hiragino Sans GB', 'Microsoft YaHei', '微软雅黑', Arial, sans-serif;
  display: flex;
  align-items: center;
  border: 2px solid rgba(0, 0, 0, 0.2);
  background-clip: padding-box;
  border-radius: 4.5px;
  opacity: 1;
  justify-content: center;
  z-index: 500;
  height: 40px;
}
</style>
