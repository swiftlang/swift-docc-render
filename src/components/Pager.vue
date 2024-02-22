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
    setActivePage(event, index) {
      event.preventDefault();

      this.activePageIndex = index;

      this.pauseObservingPages();
      const ref = this.$refs.pages[index];
      ref?.scrollIntoView({
        behavior: 'smooth',
        block: 'nearest',
        inline: 'start',
      });
      this.startObservingPages();
    },
    observePages(entries) {
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
  -webkit-overflow-scrolling: touch;
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
  width: 100%;

  @media (prefers-reduced-motion) {
    transition: none;
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
