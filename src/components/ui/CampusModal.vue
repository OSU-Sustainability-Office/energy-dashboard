<!--
  Filename: CampusModal.vue
  Info: First-visit campus picker. Built on el-dialog rather than a hand-rolled
        overlay so the scrim, focus trap and body-scroll lock come for free.

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
      <button
        v-for="campus in campuses"
        :key="campus.id"
        type="button"
        class="campus-dialog__choice"
        @click="choose(campus.id)"
      >
        <span class="campus-dialog__choice-name">{{ campus.label }}</span>
        <span class="campus-dialog__choice-meta">{{ descriptions[campus.id] }}</span>
      </button>
    </div>
  </el-dialog>
</template>

<script>
export default {
  name: 'CampusModal',
  data() {
    return {
      descriptions: {
        corvallis: 'Main campus',
        cascades: 'Bend'
      }
    }
  },
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
   specificity and is loaded after this, so a lone .campus-dialog loses and
   the panel stays white -- with white body text on top of it. */
.el-dialog.campus-dialog {
  background-color: $color-black;
  border-radius: 5px;
  box-shadow: -1px 1px 6px rgba(0, 0, 0, 0.6);
  overflow: hidden;
  padding: 0;
}

.campus-dialog .el-dialog__header {
  margin: 0;
  padding: 14px 20px;
  background-color: $color-primary;
  border-bottom: solid 1px $color-white;
}

.campus-dialog .el-dialog__body {
  padding: 20px;
  color: $color-white;
}

.campus-dialog__title {
  font-family: 'StratumNo2', sans-serif;
  /* Smaller than the 26px the other modal titles use: this one is a full
     question rather than a label, and 26px wrapped it onto two lines. */
  font-size: 22px;
  color: $color-white;
}

.campus-dialog__choices {
  display: flex;
  gap: 12px;
}

.campus-dialog__choice {
  flex: 1;
  display: flex;
  flex-direction: column;
  align-items: center;
  gap: 4px;
  padding: 16px 10px;
  border: solid 1px rgba(255, 255, 255, 0.35);
  border-radius: 5px;
  background-color: transparent;
  color: $color-white;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    border-color 0.15s ease;
}

.campus-dialog__choice:hover {
  background-color: $color-primary;
  border-color: $color-primary;
}

.campus-dialog__choice:focus-visible {
  outline: 2px solid $color-white;
  outline-offset: 2px;
}

.campus-dialog__choice-name {
  font-family: 'StratumNo2', sans-serif;
  font-size: 20px;
}

.campus-dialog__choice-meta {
  font-size: 12px;
  color: rgba(255, 255, 255, 0.7);
}

.campus-dialog__choice:hover .campus-dialog__choice-meta {
  color: rgba(255, 255, 255, 0.9);
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
