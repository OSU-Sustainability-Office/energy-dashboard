<!--
  Filename: CampusModal.vue
  Info: First-visit campus picker. Built on el-dialog rather than a hand-rolled
        overlay so the scrim, focus trap and body-scroll lock come for free.

  Styling follows the app's other dialogs (DownloadData, EditModal): a light
  el-dialog with real el-buttons, rather than the dark floating panel used by
  BuildingModal, which is a map overlay and not a dialog.

  It cannot be dismissed without choosing: every view behind it is scoped to one
  campus, so there is no sensible "no answer" state. The choice is remembered,
  so a returning visitor never sees this.
-->
<template>
  <el-dialog
    v-model="visible"
    class="campus-dialog"
    width="500px"
    align-center
    :show-close="false"
    :close-on-click-modal="false"
    :close-on-press-escape="false"
  >
    <template #header>
      <div class="campus-dialog__title">Which campus would you like to see?</div>
    </template>

    <div class="campus-dialog__choices">
      <el-button v-for="campus in campuses" :key="campus.id" type="primary" size="large" @click="choose(campus.id)">
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
.campus-dialog__title {
  /* The display face every heading on the site uses. 22px rather than the 26px
     of the map panels: this title is a full question, and 26px wrapped it. */
  font-family: 'StratumNo2', sans-serif;
  font-size: 22px;
  color: $color-black;
}

.campus-dialog__choices {
  display: flex;
  gap: 12px;
}

.campus-dialog__choices .el-button {
  flex: 1;
  height: 56px;
  font-size: 18px;
  /* Element Plus spaces adjacent buttons itself; the flex gap already does. */
  margin-left: 0;
}

@media only screen and (max-width: 520px) {
  .el-dialog.campus-dialog {
    width: calc(100% - 32px) !important;
  }
  .campus-dialog__choices {
    flex-direction: column;
  }
}
</style>
