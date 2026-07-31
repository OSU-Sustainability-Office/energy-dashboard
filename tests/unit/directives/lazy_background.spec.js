/**
 * @Description: Unit tests for the v-lazy-bg directive (Vue 3 / Vitest).
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { mount } from '@vue/test-utils'

const BG = 'url("https://example.com/thumbnails/tebeau.jpg")'

// Stands in for IntersectionObserver so a test can decide when an element
// "scrolls into view". Records observe/unobserve so we can assert the directive
// stops watching an element once its image is in place, and the options each
// observer was constructed with so we can assert which root it chose.
let fake

function installFakeObserver() {
  fake = {
    instances: [],
    observed: [],
    unobserved: [],
    fire(isIntersecting, targets) {
      for (const instance of fake.instances) {
        const entries = targets.map(target => ({ target, isIntersecting }))
        instance.callback(entries, instance)
      }
    },
    intersect(...targets) {
      this.fire(true, targets)
    },
    scrollPast(...targets) {
      this.fire(false, targets)
    }
  }
  vi.stubGlobal(
    'IntersectionObserver',
    class {
      constructor(callback, options) {
        this.callback = callback
        this.options = options
        fake.instances.push(this)
      }
      observe(el) {
        fake.observed.push(el)
      }
      unobserve(el) {
        fake.unobserved.push(el)
      }
      disconnect() {}
    }
  )
}

// The directive keeps one observer at module scope, so each test needs a fresh
// copy of the module bound to the fake installed above.
async function loadDirective() {
  vi.resetModules()
  return (await import('@/directives/lazy_background.js')).default
}

function mountWith(lazyBg, value) {
  return mount(
    {
      props: ['bg'],
      template: '<div v-lazy-bg="bg"></div>'
    },
    {
      props: { bg: value },
      global: { directives: { lazyBg } }
    }
  )
}

describe('v-lazy-bg', () => {
  beforeEach(() => {
    installFakeObserver()
  })

  it('does not set the background until the element intersects', async () => {
    const lazyBg = await loadDirective()
    const wrapper = mountWith(lazyBg, BG)
    const el = wrapper.element

    expect(el.style.backgroundImage).toBe('')
    expect(fake.observed).toContain(el)

    fake.intersect(el)
    expect(el.style.backgroundImage).toBe(BG)
  })

  it('stops observing an element once its background is applied', async () => {
    const lazyBg = await loadDirective()
    const el = mountWith(lazyBg, BG).element

    fake.intersect(el)
    expect(fake.unobserved).toContain(el)

    // A stale entry for an already-loaded element must not re-apply anything.
    el.style.backgroundImage = ''
    fake.intersect(el)
    expect(el.style.backgroundImage).toBe('')
  })

  it('leaves the background alone while the element stays off screen', async () => {
    const lazyBg = await loadDirective()
    const el = mountWith(lazyBg, BG).element

    fake.scrollPast(el)
    expect(el.style.backgroundImage).toBe('')
    expect(fake.unobserved).not.toContain(el)
  })

  it('never observes an element with no image', async () => {
    const lazyBg = await loadDirective()
    const el = mountWith(lazyBg, null).element

    expect(fake.observed).not.toContain(el)
    expect(el.style.backgroundImage).toBe('')
  })

  it('loads the newest value when it changes before the element is seen', async () => {
    const lazyBg = await loadDirective()
    const updated = 'url("https://example.com/thumbnails/milne.jpg")'
    const wrapper = mountWith(lazyBg, BG)

    await wrapper.setProps({ bg: updated })
    fake.intersect(wrapper.element)

    expect(wrapper.element.style.backgroundImage).toBe(updated)
  })

  it('starts watching an element that receives an image after mount', async () => {
    const lazyBg = await loadDirective()
    const wrapper = mountWith(lazyBg, null)

    await wrapper.setProps({ bg: BG })
    expect(fake.observed).toContain(wrapper.element)

    fake.intersect(wrapper.element)
    expect(wrapper.element.style.backgroundImage).toBe(BG)
  })

  it('unobserves an element unmounted before it is ever seen', async () => {
    const lazyBg = await loadDirective()
    const wrapper = mountWith(lazyBg, BG)
    const el = wrapper.element

    wrapper.unmount()
    expect(fake.unobserved).toContain(el)
  })

  it('applies the background immediately when IntersectionObserver is missing', async () => {
    vi.stubGlobal('IntersectionObserver', undefined)
    const lazyBg = await loadDirective()

    expect(mountWith(lazyBg, BG).element.style.backgroundImage).toBe(BG)
  })

  describe('choosing a root', () => {
    // jsdom does no layout, so scrollability has to be declared by hand.
    function makeAncestor({ overflowY, scrollHeight, clientHeight }) {
      const el = document.createElement('div')
      el.style.overflowY = overflowY
      Object.defineProperty(el, 'scrollHeight', { value: scrollHeight })
      Object.defineProperty(el, 'clientHeight', { value: clientHeight })
      document.body.appendChild(el)
      return el
    }

    function mountInside(lazyBg, ancestor) {
      return mount(
        { template: `<div v-lazy-bg='${JSON.stringify(BG)}'></div>` },
        { attachTo: ancestor, global: { directives: { lazyBg } } }
      )
    }

    it('observes against a scrolling ancestor so the prefetch margin applies to it', async () => {
      const lazyBg = await loadDirective()
      const scroller = makeAncestor({ overflowY: 'auto', scrollHeight: 2000, clientHeight: 500 })

      mountInside(lazyBg, scroller)

      expect(fake.instances).toHaveLength(1)
      expect(fake.instances[0].options.root).toBe(scroller)
      expect(fake.instances[0].options.rootMargin).toBe('200px')
    })

    it('ignores an ancestor whose content does not actually overflow', async () => {
      // The card grid sets `overflow-x: hidden`, which makes `overflow-y` compute
      // to `auto` even though it never scrolls. Treating it as the root would put
      // every card inside the root rect and load all the images at once.
      const lazyBg = await loadDirective()
      const notReallyScrolling = makeAncestor({ overflowY: 'auto', scrollHeight: 500, clientHeight: 500 })

      mountInside(lazyBg, notReallyScrolling)

      expect(fake.instances[0].options.root).toBe(null)
    })
  })
})
