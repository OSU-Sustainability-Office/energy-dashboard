<!--
  Filename: CampusToggle.vue
  Info: Two-segment campus switcher for the navigation bar.

  Deliberately not CategoryToggle: that control marks its active segment with
  $color-primary, which is also the navigation bar's background, so the selection
  would vanish. The visual language is the same (StratumNo2, 5px radius, orange
  and white) with the roles inverted for a light-on-orange context.
-->
<template>
  <div class="campus-toggle" role="group" aria-label="Campus">
    <button
      v-for="campus in campuses"
      :key="campus.id"
      type="button"
      class="campus-option"
      :class="{ active: campus.id === active }"
      :aria-pressed="campus.id === active"
      @click="select(campus.id)"
    >
      {{ campus.label }}
    </button>
  </div>
</template>

<script>
export default {
  name: 'CampusToggle',
  computed: {
    campuses() {
      return this.$store.getters['campus/campuses']
    },
    active() {
      return this.$store.getters['campus/active']
    }
  },
  methods: {
    select(id) {
      if (id !== this.active) {
        this.$store.dispatch('campus/choose', id)
      }
    }
  }
}
</script>

<style scoped lang="scss">
.campus-toggle {
  display: flex;
  align-self: center;
  border: 1px solid rgba(255, 255, 255, 0.65);
  border-radius: 5px;
  overflow: hidden;
}

.campus-option {
  font-family: 'StratumNo2', sans-serif;
  font-size: 14px;
  line-height: 1;
  padding: 7px 14px;
  border: 0;
  background-color: transparent;
  color: $color-white;
  cursor: pointer;
  transition:
    background-color 0.15s ease,
    color 0.15s ease;
}

.campus-option:hover:not(.active) {
  background-color: rgba(0, 0, 0, 0.18);
}

.campus-option.active {
  background-color: $color-white;
  color: $color-primary;
}

.campus-option:focus-visible {
  outline: 2px solid $color-white;
  outline-offset: -2px;
}

@media only screen and (max-width: 700px) {
  .campus-option {
    padding: 6px 9px;
    font-size: 13px;
  }
}
</style>
