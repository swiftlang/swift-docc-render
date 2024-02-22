<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div class="pager">
    <div class="container">
      <div class="gutter left">
        <button
          class="control"
          :disabled="activePageIndex < 1"
          @click="setActivePage($event, activePageIndex - 1)"
        >
          <ChevronIcon class="icon-retreat" />
        </button>
      </div>
      <div class="viewport" ref="viewport">
        <div
          v-for="({ page, key }, n) in keyedPages"
          ref="pages"
          :class="['page', pageStates(n)]"
          :id="key"
          :key="key"
        >
          <slot name="page" :page="page" />
        </div>
      </div>
      <div class="gutter right">
        <button
          class="control"
          :disabled="activePageIndex >= (keyedPages.length - 1)"
          @click="setActivePage($event, activePageIndex + 1)"
        >
          <ChevronIcon class="icon-advance" />
        </button>
      </div>
    </div>
    <div v-if="keyedPages.length > 1" class="indicators">
      <a
        v-for="({ key }, n) in keyedPages"
        :href="`#${key}`"
        :key="key"
        :class="['indicator', pageStates(n)]"
        @click="setActivePage($event, n)"
      />
    </div>
    <slot />
  </div>
</template>

<script>
import ChevronIcon from 'theme/components/Icons/ChevronIcon.vue';

function waitForScrollIntoView(element) {
  // call `scrollIntoView` to start asynchronously scrollling the off-screen
  // page element into the viewport area (would be sync if the behavior is
  // instant, but there is an async animation for "smooth" behavior)
  element.scrollIntoView({
    behavior: 'auto',
    block: 'nearest',
    inline: 'start',
  });

  // until the "scrollend" event is more widely supported, we need to manually
  // poll every animation frame to manually check if the element is still being
  // scrolled or not
  return new Promise((resolve) => {
    // scroll animation shouldn't realistically take longer than this, so this
    // will be used as a timeout to exit early and avoid looping forever if
    // something goes wrong down below
    const maxFramesToWait = 60;
    // shouldn't realistically go quicker than a couple frames either
    const minFramesToWait = 2;

    // since the scroll animation is not necessarily immediate, we'll utilize
    // `requestAnimationFrame` to poll every frame and check if the element
    // has finished scrolling and wait to finish the promise until it has
    // finished (or we reach a timeout expressed as a maximum number of frames
    // to wait for)
    let prevLeftPosition = null;
    let numFramesWaited = 0;
    function waitForScrollEnd() {
      const currentLeftPosition = element.getBoundingClientRect().left;
      // stop waiting and resolve the promise if the timeout is reached or the
      // scroll has finished as calculated from the element position
      if ((numFramesWaited > minFramesToWait)
           && ((currentLeftPosition === prevLeftPosition)
               || (numFramesWaited >= maxFramesToWait))) {
        resolve(); // done waiting
      } else {
        // otherwise, advance to the next frame to check again by recursively
        // calling this function
        prevLeftPosition = currentLeftPosition;
        numFramesWaited += 1;
        requestAnimationFrame(waitForScrollEnd); // continue waiting
      }
    }
    requestAnimationFrame(waitForScrollEnd); // start waiting
  });
}

/**
 * Provides a way of viewing one of many pages of content at a time.
 *
 * This component is similar to what is sometimes referred to as a "carousel"
 * of content. Users of this component specify an array of "pages" and can
 * specify how individual pages are presented through slots.
 *
 * ### Example
 *
 * As an example, this is how you could present a pager, which pages between
 * a few different paragraphs. Only one will be shown at a time, and there
 * will be controls to select which paragraph is currently showing.
 *
 * ```html
 * <Pager :pages="['a', 'b', 'c']">
 *   <template #page="{ page }">
 *     <p>{{ page }}</p>
 *   </template>
 * </Pager>
 * ```
 *
 * - Parameter pages: `Array` (**required**) - An non-empty array of any kind of
 *     content—each individual item will be provided as a prop to `page` slots.
 */
export default {
  name: 'Pager',
  components: { ChevronIcon },
  props: {
    pages: {
      type: Array,
      required: true,
      validator: value => value.length > 0,
    },
  },
  data: () => ({
    activePageIndex: 0,
  }),
  computed: {
    indices: ({ keyedPages }) => keyedPages.reduce((obj, item, i) => ({
      ...obj,
      [item.key]: i,
    }), {}),
    keyedPages: ({ _uid, pages }) => pages.map((page, i) => ({
      key: `pager-${_uid}-page-${i}`,
      page,
    })),
  },
  methods: {
    isActivePage(index) {
      return index === this.activePageIndex;
    },
    pageStates(index) {
      return { active: this.isActivePage(index) };
    },
    async setActivePage(event, index) {
      event.preventDefault();
      if ((index === this.activePageIndex)
        || (index < 0)
        || (index >= this.$refs.pages.length)) {
        return;
      }

      const ref = this.$refs.pages[index];
      // stop observing page elements visibility while scrolling to the active
      // one so that the indicators for pages in between the previous and
      // currently active one don't activate
      this.pauseObservingPages();
      await waitForScrollIntoView(ref);
      this.startObservingPages();

      this.activePageIndex = index;
    },
    observePages(entries) {
      // observe page visibility so that we can activate the indicator for the
      // right one as the user scrolls through the viewport
      const visibleKey = entries.find(entry => entry.isIntersecting)?.target?.id;
      if (visibleKey) {
        this.activePageIndex = this.indices[visibleKey];
      }
    },
    startObservingPages() {
      this.$refs.pages.forEach((page) => {
        this.observer?.observe(page);
      });
    },
    pauseObservingPages() {
      this.$refs.pages.forEach((page) => {
        this.observer?.unobserve(page);
      });
    },
  },
  mounted() {
    this.observer = new IntersectionObserver(this.observePages, {
      root: this.$refs.viewport,
      threshold: 0.5,
    });
    this.startObservingPages();
  },
  beforeDestroy() {
    this.observer?.disconnect();
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.pager {
  --control-size: 3em;
  --control-color-fill: var(--color-fill-tertiary);
  --control-color-figure: currentColor;

  --indicator-size: 0.65em;
  --indicator-color-fill-active: currentColor;
  --indicator-color-fill-inactive: var(--color-fill-tertiary);

  --gutter-width: #{$large-viewport-dynamic-content-padding};
}

.viewport {
  display: flex;
  overflow-x: auto;
  scroll-behavior: smooth;
  scroll-snap-type: x mandatory;
  scrollbar-width: none;
  -webkit-overflow-scrolling: touch;

  &::-webkit-scrollbar {
    height: 0;
    width: 0;
  }
}

.container {
  position: relative;
}

.gutter {
  align-items: center;
  display: flex;
  justify-content: center;
  position: absolute;
  height: 100%;
  top: 0;
  width: var(--gutter-width);
  z-index: 42;

  @include breakpoint(small) {
    display: none;
  }

  &.left {
    left: calc(var(--gutter-width) * -1);
  }

  &.right {
    right: calc(var(--gutter-width) * -1);
  }
}

.control {
  align-items: center;
  background: var(--control-color-fill);
  border: 1px solid var(--control-color-fill);
  border-radius: 50%;
  display: flex;
  height: var(--control-size);
  justify-content: center;
  width: var(--control-size);

  &[disabled] {
    display: none;
  }

  .icon-advance,
  .icon-retreat {
    height: 65%;
    width: 65%;
  }

  .icon-advance {
    transform: scale(1, 1);
  }

  .icon-retreat {
    transform: scale(-1, 1);
  }
}

.page {
  flex-shrink: 0;
  margin-right: var(--gutter-width);
  position: relative;
  scroll-snap-align: start;
  transform: scale(1);
  transform-origin: center center;
  transition: transform 0.5s ease-in-out;
  user-select: none;
  width: 100%;

  @media (prefers-reduced-motion) {
    transition: none;
  }

  &.active {
    user-select: auto;
  }
}

.indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  justify-content: center;
  margin-top: 1rem;
}

.indicator {
  background: var(--indicator-color-fill-inactive);
  border: 1px solid var(--indicator-color-fill-inactive);
  border-radius: 50%;
  color: currentColor;
  display: block;
  flex: 0 0 auto;
  height: var(--indicator-size);
  width: var(--indicator-size);

  &.active {
    background: var(--indicator-color-fill-active);
    border-color: var(--indicator-color-fill-active);
  }
}
</style>
