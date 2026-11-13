<!--
  Filename: CampusSwitcher.vue
  Info: Campus menu for the navigation bar, sitting beside the logo.

  The campus scopes every page, so it lives with the site's identity rather than
  among the page links, and is styled as one of them (StratumNo2 pill, dark hover
  tint) so the bar reads as a single control set. A menu rather than a segmented
  toggle: it matches the links' weight and takes more campuses without growing.
-->
<template>
  <el-dropdown trigger="click" popper-class="campus-menu" @command="select" @visible-change="open = $event">
    <button type="button" class="campus-trigger" :class="{ open }" :aria-label="`Campus: ${activeLabel}`">
      <svg class="campus-pin" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M12 21.5s7-6.1 7-11.5a7 7 0 0 0-14 0c0 5.4 7 11.5 7 11.5z" />
        <circle cx="12" cy="10" r="2.5" />
      </svg>
      {{ activeLabel }}
      <svg class="campus-caret" viewBox="0 0 24 24" aria-hidden="true">
        <path d="M6 9l6 6 6-6" />
      </svg>
    </button>
    <template #dropdown>
      <el-dropdown-menu>
        <el-dropdown-item
          v-for="campus in campuses"
          :key="campus.id"
          :command="campus.id"
          :class="{ 'is-current': campus.id === active }"
        >
          <span class="campus-check">
            <svg v-if="campus.id === active" viewBox="0 0 24 24" aria-hidden="true">
              <path d="M5 12.5l4.5 4.5L19 7.5" />
            </svg>
          </span>
          {{ campus.label }}
        </el-dropdown-item>
      </el-dropdown-menu>
    </template>
  </el-dropdown>
</template>

<script>
export default {
  name: 'CampusSwitcher',
  data() {
    return {
      open: false
    }
  },
  computed: {
    campuses() {
      return this.$store.getters['campus/campuses']
    },
    active() {
      return this.$store.getters['campus/active']
    },
    activeLabel() {
      const campus = this.campuses.find(c => c.id === this.active)
      return campus ? campus.label : 'Campus'
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

<!-- Mirrors .navLink in NavigationBar.vue; keep the two in step. -->
<style scoped lang="scss">
.campus-trigger {
  display: flex;
  align-items: center;
  gap: 7px;
  font-family: 'StratumNo2', sans-serif;
  font-size: 18px;
  line-height: 1;
  padding: 14px 14px;
  border: 0;
  border-radius: 5px;
  background-color: transparent;
  color: $color-white;
  cursor: pointer;
  transition: background-color 0.15s ease;
}

.campus-trigger:hover,
.campus-trigger.open {
  background-color: rgba(0, 0, 0, 0.15);
}

.campus-trigger:focus-visible {
  outline: 2px solid $color-white;
  outline-offset: -2px;
}

.campus-trigger svg {
  fill: none;
  stroke: currentColor;
  stroke-width: 2.2;
  stroke-linecap: round;
  stroke-linejoin: round;
}

.campus-pin {
  width: 18px;
  height: 18px;
}

.campus-caret {
  width: 16px;
  height: 16px;
  transition: transform 0.15s ease;
}

.campus-trigger.open .campus-caret {
  transform: rotate(180deg);
}
</style>

<!--
  Not scoped: the menu teleports to body, so a scoped attribute would never
  match it. Every selector is namespaced under .campus-menu instead.
-->
<style lang="scss">
.campus-menu .el-dropdown-menu__item {
  font-family: 'StratumNo2', sans-serif;
  font-size: 16px;
  padding: 9px 18px 9px 10px;
}

.campus-menu .el-dropdown-menu__item.is-current {
  color: $color-primary;
}

/* Fixed width whether or not it holds the check, so the labels line up. */
.campus-menu .campus-check {
  display: inline-flex;
  width: 18px;
  margin-right: 6px;
}

.campus-menu .campus-check svg {
  width: 16px;
  height: 16px;
  fill: none;
  stroke: currentColor;
  stroke-width: 2.5;
  stroke-linecap: round;
  stroke-linejoin: round;
}
</style>
