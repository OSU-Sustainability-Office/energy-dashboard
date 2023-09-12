<!--
  Filename: switch_buttons.vue
  Description: Component for button input on the side-view bar (the category/energy trend)
-->
<template>
  <el-row class="buttons">
    <el-col
      v-for="(title, index) in titles"
      :key="title"
      :style="`width: ${100.0 / titles.length}%; left: ${-13.33 * index}px`"
      class="rangeButtonParent"
      v-bind:class="{ active: value === title }"
      ref="buttonParents"
    >
      <el-button class="rangeButton" @click="$emit('input', title)">{{ title }}</el-button>
    </el-col>
  </el-row>
</template>
<script>
export default {
  props: ['titles', 'value'],
  data () {
    return {
      currentRange: -1
    }
  },
  mounted () {},
  computed: {},
  watch: {},
  methods: {}
}
</script>
<style scoped lang="scss">
.buttons {
  left: 6.65px;
  padding: 10px;
  height: 80px !important;
}
$buttonHeight: 35px;
$parentPadding: 2px;
$activeheight: 35px;
$activePadding: 2.5px;
$clipInset: 10px;

.rangeButtonParent {
  top: 45px;
  position: relative;
  width: 100%;
  padding: $parentPadding;
  background-color: darken($--color-white, 30%);
  clip-path: polygon(
    #{$clipInset/$buttonHeight * ($buttonHeight + 2 * $parentPadding)} 0%,
    0% 100%,
    calc(100% - #{$clipInset/$buttonHeight * ($buttonHeight + 2 * $parentPadding)}) 100%,
    100% 0%
  );
  margin: 0 !important;
}
.rangeButtonParent:not(.active) {
  top: 45px;
}
.rangeButtonParent:first-child {
  border-radius: 5px 0px 0px 5px;
  clip-path: polygon(
    0% 0%,
    0% 100%,
    calc(100% - #{$clipInset/$buttonHeight * ($buttonHeight + 2 * $parentPadding)}) 100%,
    100% 0%
  );
}

.rangeButtonParent:last-child {
  // left: -26px;
  border-radius: 0px 5px 5px 0px;
  clip-path: polygon(
    #{$clipInset/$buttonHeight * ($buttonHeight + 2 * $parentPadding)} 0%,
    0% 100%,
    100% 100%,
    100% 0%
  );
}
.rangeButton {
  border-radius: 0px;
  clip-path: polygon(#{$clipInset} 0%, 0% 100%, calc(100% - #{$clipInset}) 100%, 100% 0%);
  background-color: $--color-black;
  color: darken($--color-white, 30%);
  border: 0px !important;
  width: 100%;
  height: $buttonHeight;
  font-size: 12px;
  text-overflow: ellipsis;
  white-space: nowrap;
}
.rangeButtonParent:first-child .rangeButton {
  border-radius: 5px 0px 0px 5px;
  clip-path: polygon(0% 0%, 0% 100%, calc(100% - #{$clipInset}) 100%, 100% 0%);
}
.rangeButtonParent:last-child .rangeButton {
  border-radius: 0px 5px 5px 0px;
  clip-path: polygon(#{$clipInset} 0%, 0% 100%, 100% 100%, 100% 0%);
}
.rangeButtonParent:not(.active):hover .rangeButton {
  z-index: 3;
  background-color: $--color-black; //darken($--color-primary, 10%);
  color: $--color-white;
  border: 0px;
}

.rangeButtonParent:not(.active):hover {
  z-index: 2;
  background-color: $--color-white; //darken($--color-primary, 10%);
}

.rangeButtonParent.active {
  clip-path: polygon(
    #{$clipInset/$buttonHeight * ($activeheight + 2 * $activePadding)} 0%,
    0% 100%,
    calc(100% - #{$clipInset/$buttonHeight * ($activeheight + 2 * $activePadding)}) 100%,
    100% 0%
  );
  padding: $activePadding;
  background-color: $--color-white;
  z-index: 2;
}

.rangeButtonParent:first-child.active {
  clip-path: polygon(
    0% 0%,
    0% 100%,
    calc(100% - #{$clipInset/$buttonHeight * ($activeheight + 2 * $activePadding)}) 100%,
    100% 0%
  );
}
.rangeButtonParent:last-child.active {
  clip-path: polygon(
    #{$clipInset/$buttonHeight * ($activeheight + 2 * $activePadding)} 0%,
    0% 100%,
    100% 100%,
    100% 0%
  );
}
.rangeButtonParent.active .rangeButton {
  clip-path: polygon(
    #{$clipInset/$buttonHeight * $activeheight} 0%,
    0% 100%,
    calc(100% - #{$clipInset/$buttonHeight * $activeheight}) 100%,
    100% 0%
  );
}
.rangeButtonParent:first-child.active .rangeButton {
  clip-path: polygon(0% 0%, 0% 100%, calc(100% - #{$clipInset/$buttonHeight * $activeheight}) 100%, 100% 0%);
}
.rangeButtonParent:last-child.active .rangeButton {
  clip-path: polygon(#{$clipInset/$buttonHeight * $activeheight} 0%, 0% 100%, 100% 100%, 100% 0%);
}
.rangeButtonParent.active .rangeButton {
  background-color: $--color-primary;
  color: $--color-white;
  height: $activeheight;
}
.rangeButtonParent.active .rangeButton:hover {
  background-color: $--color-primary;
  color: $--color-white;
  border: 0px;
}
</style>
