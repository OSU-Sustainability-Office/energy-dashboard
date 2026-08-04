/*
  Filename: setup.js
  Info: Global setup run before each Vitest test file.
*/

// The data store uses IndexedDB; provide an in-memory implementation so it works
// under jsdom (this was previously loaded via Jest's setupFiles).
import 'fake-indexeddb/auto'

// jsdom has no ResizeObserver, which some element-plus components construct on
// mount. Provide a no-op stub so component tests can mount them.
if (!globalThis.ResizeObserver) {
  globalThis.ResizeObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}

// jsdom has no IntersectionObserver either; the v-lazy-bg directive constructs
// one. Nothing ever intersects under this stub, which is what we want for
// component tests -- specs that need it to fire stub it themselves.
if (!globalThis.IntersectionObserver) {
  globalThis.IntersectionObserver = class {
    observe() {}
    unobserve() {}
    disconnect() {}
  }
}
