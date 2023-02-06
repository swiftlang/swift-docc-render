<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div class="OnThisPageNav">
    <ul class="items">
      <li
        v-for="item in onThisPageSections"
        :key="item.anchor"
        :class="getItemClasses(item)"
      >
        <router-link
          :to="item.url"
          class="base-link"
          @click.native="handleFocusAndScroll(item.anchor)"
        >
          <WordBreak>{{ item.title }}</WordBreak>
        </router-link>
      </li>
    </ul>
  </div>
</template>

<script>
import throttle from 'docc-render/utils/throttle';
import { waitFrames } from 'docc-render/utils/loading';
import ScrollToElement from 'docc-render/mixins/scrollToElement';
import { buildUrl } from 'docc-render/utils/url-helper';
import WordBreak from 'docc-render/components/WordBreak.vue';

export default {
  name: 'OnThisPageNav',
  components: { WordBreak },
  mixins: [ScrollToElement],
  inject: {
    store: {
      default() {
        return {
          state: { onThisPageSections: [], currentPageAnchor: null },
        };
      },
    },
  },
  computed: {
    onThisPageSections: ({ store, $route }) => store.state.onThisPageSections.map(item => ({
      ...item,
      url: buildUrl(`#${item.anchor}`, $route.query),
    })),
    currentPageAnchor: ({ store }) => store.state.currentPageAnchor,
  },
  async mounted() {
    window.addEventListener('scroll', this.onScroll, false);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('scroll', this.onScroll);
    });
  },
  watch: {
    onThisPageSections: {
      immediate: true,
      async handler() {
        await waitFrames(8);
        this.onScroll();
      },
    },
  },
  methods: {
    onScroll: throttle(function onScroll() {
      // if there are no sections, exit early
      const len = this.onThisPageSections.length;
      if (!len) return;
      // get the point at which we intercept, 1/3 of screen
      const { scrollY, innerHeight } = window;
      const { scrollHeight } = document.body;
      const isBottom = scrollY + innerHeight >= scrollHeight;
      const isTop = scrollY <= 0;
      const intersectionPoint = (innerHeight * 0.3) + scrollY;
      if (isTop || isBottom) {
        const index = isTop ? 0 : len - 1;
        this.store.setCurrentPageSection(this.onThisPageSections[index].anchor);
        return;
      }
      // init loop vars
      let nearestAnchor = null;
      let i;
      let item;
      for (i = 0; i < len; i += 1) {
        item = this.onThisPageSections[i];
        // get the element's offset
        const { offsetTop } = document.getElementById(item.anchor);
        // if the element is above the intersection point, it is "active".
        if (offsetTop < intersectionPoint) {
          nearestAnchor = item.anchor;
        } else {
          // item is below the intersectionPoint, so we bail
          break;
        }
      }
      // set the nearest index as active
      if (nearestAnchor !== null) {
        this.store.setCurrentPageSection(nearestAnchor);
      }
    }, 100),
    /**
     * Returns whether the current item or some of its children is active.
     * @param item
     * @returns {boolean}
     */
    checkIsActive(item) {
      return item.anchor === this.currentPageAnchor;
    },
    getItemClasses(item) {
      return {
        active: this.checkIsActive(item),
        'parent-item': item.level <= 2,
        'child-item': item.level === 3,
      };
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

ul {
  list-style-type: none;
  margin: 0;
}

.parent-item .base-link {
  font-weight: $font-weight-bold;
}

.base-link {
  color: var(--color-figure-gray-secondary);
  @include font-styles(body-reduced-tight);
  display: inline-block;
  margin-bottom: 5px;
  transition: color 0.15s ease-in;
  max-width: 100%;
}

.active .base-link {
  color: var(--color-text);
}
</style>
