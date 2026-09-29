<!--
  Filename: CampusModal.vue
  Info: First-visit campus picker. Built on el-dialog rather than a hand-rolled
        overlay so the scrim, focus trap and body-scroll lock come for free.

  The orange StratumNo2 title bar is the app's own idiom (BuildingModal,
  BuildingCompareModal, the nav), sitting on a light dialog body like the app's
  other dialogs. The buttons are real el-buttons, kept `plain` so the header
  stays the one block of solid colour.

  It cannot be dismissed without choosing: every view behind it is scoped to one
  campus, so there is no sensible "no answer" state. The choice is remembered,
  so a returning visitor never sees this.
-->
<template>
  <el-dialog
    v-model="visible"
    class="campus-dialog"
    width="420px"
    align-center
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template #header>
      <div class="campus-dialog__title">Which campus would you like to see?</div>
    </template>

    <div class="campus-dialog__choices">
      <el-button v-for="campus in campuses" :key="campus.id" type="primary" plain @click="choose(campus.id)">
        {{ campus.label }}
      </el-button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'CampusModal',
  computed: {
    campuses() {
      return this.$store.getters['campus/campuses']
    },
    visible: {
      get() {
        return !this.$store.getters['campus/chosen']
      },
      // Element Plus writes to the model on its own close paths. Picking a campus
      // is the only thing that closes this dialog, so there is nothing to do here.
      set() {}
    }
  },
  methods: {
    choose(id) {
      this.$store.dispatch('campus/choose', id)
    }
  }
}
</script>

<!--
  Not scoped: el-dialog teleports to body, so a scoped attribute would never
  match it. Every selector is namespaced under .campus-dialog instead.
-->
<style lang="scss">
/* Two classes deliberately: Element Plus styles .el-dialog at the same
   specificity and is loaded after this, so a lone .campus-dialog loses. */
.el-dialog.campus-dialog {
  border-radius: 5px;
  /* Clips the orange bar to the rounded corners. */
  overflow: hidden;
  padding: 0;
}

.campus-dialog .el-dialog__header {
  margin: 0;
  padding: 16px 22px;
  background-color: $color-primary;
}

.campus-dialog__title {
  font-family: 'StratumNo2', sans-serif;
  /* 18px keeps the question on one line at this width; wrapping it made the
     header top-heavy. */
  font-size: 18px;
  line-height: 1.2;
  color: $color-white;
}

.campus-dialog .el-dialog__body {
  padding: 24px;
}

/* Stacked, not side by side: two wide buttons in a row left the dialog a 3:1
   letterbox. Full-width rows give it a card shape and a bigger target each. */
.campus-dialog__choices {
  display: flex;
  flex-direction: column;
  gap: 12px;
}

.campus-dialog__choices .el-button {
  width: 100%;
  height: 56px;
  font-family: 'StratumNo2', sans-serif;
  font-size: 18px;
  /* Its `plain` variant tints the fill and fades the border to a pale pink,
     which reads as disabled beside the solid header. Full-strength brand
     colour on white instead, inverting on hover. */
  background-color: $color-white;
  border: solid 2px $color-primary;
  color: $color-primary;
}

/* Element Plus indents every button that follows another. The flex gap already
   spaces these, and with width:100% that indent pushed the second one out of
   alignment and over the edge. Needs the adjacent selector to outrank it. */
.campus-dialog__choices .el-button + .el-button {
  margin-left: 0;
}

.campus-dialog__choices .el-button:hover,
.campus-dialog__choices .el-button:focus-visible {
  background-color: $color-primary;
  border-color: $color-primary;
  color: $color-white;
}

@media only screen and (max-width: 520px) {
  .el-dialog.campus-dialog {
    width: calc(100% - 32px) !important;
  }
}
</style>
