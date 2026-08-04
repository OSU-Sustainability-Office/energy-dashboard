/**
  Filename: lazy_background.js
  Info: `v-lazy-bg` directive. Holds a CSS background-image value back until the
  element is near the viewport, so a long list of cards does not fetch every
  image at once. Elements inside a hidden subtree (an inactive tab pane, a
  search-filtered card) never intersect, so they cost nothing until shown.
*/

// One observer per scroll root, shared by every element inside it, rather than
// one per card. Created lazily so importing this module has no side effects.
const observers = new Map()

// What each element is waiting on, and which observer is watching it. Weak so an
// element removed before it ever scrolls into view can be collected.
const pending = new WeakMap()

// Elements whose image has already been set. Distinguishes "done" from "never
// registered", which `pending` alone cannot.
const applied = new WeakSet()

// Start fetching before the element is actually on screen, so images are usually
// in place by the time the user scrolls to them.
const ROOT_MARGIN = '200px'

const SCROLLABLE = ['auto', 'scroll', 'overlay']

// `rootMargin` only pads the observer's own root, so an ancestor that scrolls
// has to be the root or the margin above buys nothing. Note that `overflow-x:
// hidden` makes `overflow-y` compute to `auto` on elements that never scroll
// (the card grid is one), so the style alone is not enough -- require content
// that actually overflows. Guessing wrong here only costs the prefetch margin;
// intersection against the viewport is still correct through clipping ancestors.
function isScrollable(el) {
  return SCROLLABLE.includes(getComputedStyle(el).overflowY) && el.scrollHeight > el.clientHeight
}

// Returns the nearest scrolling ancestor, or null to observe against the viewport.
function findScrollRoot(el) {
  let parent = el.parentElement
  while (parent && parent !== document.body && parent !== document.documentElement) {
    if (isScrollable(parent)) {
      return parent
    }
    parent = parent.parentElement
  }
  return null
}

function apply(el) {
  el.style.backgroundImage = pending.get(el).value
  pending.delete(el)
  applied.add(el)
}

function getObserver(root) {
  if (!observers.has(root)) {
    observers.set(
      root,
      new IntersectionObserver(
        (entries, observer) => {
          for (const entry of entries) {
            if (entry.isIntersecting && pending.has(entry.target)) {
              apply(entry.target)
              observer.unobserve(entry.target)
            }
          }
        },
        { root, rootMargin: ROOT_MARGIN }
      )
    )
  }
  return observers.get(root)
}

function watch(el, value) {
  // Without IntersectionObserver there is no way to tell when the element is
  // visible, so fall back to loading immediately rather than never.
  if (typeof IntersectionObserver === 'undefined') {
    pending.set(el, { value, observer: null })
    apply(el)
    return
  }
  const observer = getObserver(findScrollRoot(el))
  pending.set(el, { value, observer })
  observer.observe(el)
}

export default {
  mounted(el, binding) {
    if (binding.value) {
      watch(el, binding.value)
    }
  },

  updated(el, binding) {
    if (!binding.value || binding.value === binding.oldValue || applied.has(el)) {
      return
    }
    const entry = pending.get(el)
    if (entry) {
      // Still waiting to scroll into view; just swap what it will load.
      entry.value = binding.value
    } else {
      // Mounted without a value (the building had no image yet) and got one later.
      watch(el, binding.value)
    }
  },

  unmounted(el) {
    const entry = pending.get(el)
    if (entry) {
      pending.delete(el)
      entry.observer?.unobserve(el)
    }
  }
}
