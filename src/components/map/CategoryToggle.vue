<!--
  Filename: CategoryToggle.vue
  Description: Component for button input on the side-view bar (the category/energy trend)
-->
<template>
  <el-row class="buttons">
    <el-col
      v-for="(title, index) in titles"
      :span="12"
      :key="title"
      :style="`width: ${100.0 / titles.length}%; left: ${-13.33 * index}px`"
      class="rangeButtonParent"
      :class="{ active: modelValue === title }"
      ref="buttonParents"
    >
      <el-button class="rangeButton" @click="$emit('update:modelValue', title)">{{ title }}</el-button>
    </el-col>
  </el-row>
</template>
<script>
export default {
  props: ['titles', 'modelValue'],
  data () {
    return {
      currentRange: -1
    }
  }
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
  top: 50px;
  position: relative;
  width: 100%;
  padding: $parentPadding;
  background-color: color.adjust($color-white, $lightness: -30%);
  clip-path: polygon(
    #{calc($clipInset / $buttonHeight) * ($buttonHeight + 2 * $parentPadding)} 0%,
    0% 100%,
    calc(100% - #{calc($clipInset / $buttonHeight) * ($buttonHeight + 2 * $parentPadding)}) 100%,
    100% 0%
  );
  margin: 0 !important;
}
.rangeButtonParent:not(.active) {
  top: 50px;
  height: $buttonHeight + 4px;
}
.rangeButtonParent:first-child {
  border-radius: 5px 0px 0px 5px;
  clip-path: polygon(
    0% 0%,
    0% 100%,
    calc(100% - #{calc($clipInset / $buttonHeight) * ($buttonHeight + 2 * $parentPadding)}) 100%,
    100% 0%
  );
}

.rangeButtonParent:last-child {
  border-radius: 0px 5px 5px 0px;
  clip-path: polygon(
    #{calc($clipInset / $buttonHeight) * ($buttonHeight + 2 * $parentPadding)} 0%,
    0% 100%,
    100% 100%,
    100% 0%
  );
}
.rangeButton {
  border-radius: 0px;
  clip-path: polygon(#{$clipInset} 0%, 0% 100%, calc(100% - #{$clipInset}) 100%, 100% 0%);
  background-color: $color-black;
  color: color.adjust($color-white, $lightness: -30%);
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
  background-color: $color-black;
  color: $color-white;
  border: 0px;
}

.rangeButtonParent:not(.active):hover {
  z-index: 2;
  background-color: $color-white;
}

.rangeButtonParent.active {
  clip-path: polygon(
    #{calc($clipInset / $buttonHeight) * ($activeheight + 2 * $activePadding)} 0%,
    0% 100%,
    calc(100% - #{calc($clipInset / $buttonHeight) * ($activeheight + 2 * $activePadding)}) 100%,
    100% 0%
  );
  padding: $activePadding;
  background-color: $color-white;
  z-index: 2;
  height: $activeheight + 4px;
}

.rangeButtonParent:first-child.active {
  clip-path: polygon(
    0% 0%,
    0% 100%,
    calc(100% - #{calc($clipInset / $buttonHeight) * ($activeheight + 2 * $activePadding)}) 100%,
    100% 0%
  );
}
.rangeButtonParent:last-child.active {
  clip-path: polygon(
    #{calc($clipInset / $buttonHeight) * ($activeheight + 2 * $activePadding)} 0%,
    0% 100%,
    100% 100%,
    100% 0%
  );
}
.rangeButtonParent.active .rangeButton {
  clip-path: polygon(
    #{calc($clipInset / $buttonHeight) * $activeheight} 0%,
    0% 100%,
    calc(100% - #{calc($clipInset / $buttonHeight) * $activeheight}) 100%,
    100% 0%
  );
}
.rangeButtonParent:first-child.active .rangeButton {
  clip-path: polygon(0% 0%, 0% 100%, calc(100% - #{calc($clipInset / $buttonHeight) * $activeheight}) 100%, 100% 0%);
}
.rangeButtonParent:last-child.active .rangeButton {
  clip-path: polygon(#{calc($clipInset / $buttonHeight) * $activeheight} 0%, 0% 100%, 100% 100%, 100% 0%);
}
.rangeButtonParent.active .rangeButton {
  background-color: $color-primary;
  color: $color-white;
  height: $activeheight;
}
.rangeButtonParent.active .rangeButton:hover {
  background-color: $color-primary;
  color: $color-white;
  border: 0px;
}
</style>
