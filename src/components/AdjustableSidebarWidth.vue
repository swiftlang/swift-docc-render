<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="adjustable-sidebar-width">
    <div
      v-if="!hideSidebar"
      ref="sidebar"
      class="sidebar"
      :class="{ 'fully-open': isMaxWidth }"
    >
      <div
        :class="{ dragging: isDragging, 'force-open': openExternally }"
        :style="{ width: widthInPx }"
        class="aside"
      >
        <slot name="aside" />
      </div>
      <div
        class="resize-handle"
        @mousedown.prevent="startDrag"
        @touchstart.prevent="startDrag"
      />
    </div>
    <div class="content">
      <slot />
    </div>
    <BreakpointEmitter @change="breakpoint = $event" />
  </div>
</template>

<script>
import { storage } from 'docc-render/utils/storage';
import debounce from 'docc-render/utils/debounce';
import BreakpointEmitter from 'docc-render/components/BreakpointEmitter.vue';
import { BreakpointName } from '@/utils/breakpoints';

export const STORAGE_KEY = 'sidebar';

// the maximum width, after which the full-width content does not grow
export const MAX_WIDTH = 1800;

export const eventsMap = {
  touch: {
    move: 'touchmove',
    end: 'touchend',
  },
  mouse: {
    move: 'mousemove',
    end: 'mouseup',
  },
};

const calcWidthPercent = (percent, windowWidth = window.innerWidth) => {
  const maxWidth = Math.min(windowWidth, MAX_WIDTH);
  return Math.floor(Math.min(maxWidth * (percent / 100), maxWidth));
};

export const minWidthResponsivePercents = {
  medium: 30,
  large: 20,
};

export const maxWidthResponsivePercents = {
  medium: 50,
  large: 50,
};

export default {
  name: 'AdjustableSidebarWidth',
  components: {
    BreakpointEmitter,
  },
  props: {
    openExternally: {
      type: Boolean,
      default: false,
    },
    hideSidebar: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    // get the min width, in case we dont have a previously saved value
    const fallback = calcWidthPercent(minWidthResponsivePercents[BreakpointName.large]);
    // computed is not ready yet in `data`.
    return {
      isDragging: false,
      width: Math.min(
        storage.get(STORAGE_KEY, fallback),
        // calc the maximum width
        calcWidthPercent(maxWidthResponsivePercents[BreakpointName.large]),
      ),
      isTouch: false,
      windowWidth: window.innerWidth,
      breakpoint: BreakpointName.large,
    };
  },
  computed: {
    minWidthPercent: ({ breakpoint }) => minWidthResponsivePercents[breakpoint] || 0,
    maxWidthPercent: ({ breakpoint }) => maxWidthResponsivePercents[breakpoint] || 100,
    maxWidth: ({ maxWidthPercent, windowWidth }) => (
      calcWidthPercent(maxWidthPercent, windowWidth)
    ),
    minWidth: ({ minWidthPercent, windowWidth }) => calcWidthPercent(minWidthPercent, windowWidth),
    widthInPx: ({ width }) => `${width}px`,
    isMaxWidth: ({ width, maxWidth }) => width === maxWidth,
    events: ({ isTouch }) => (isTouch ? eventsMap.touch : eventsMap.mouse),
  },
  mounted() {
    window.addEventListener('keydown', this.onEscapeClick);
    window.addEventListener('resize', this.storeWindowSize);
    window.addEventListener('orientationchange', this.storeWindowSize);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('keydown', this.onEscapeClick);
      window.removeEventListener('resize', this.storeWindowSize);
      window.removeEventListener('orientationchange', this.storeWindowSize);
    });
  },
  watch: {
    // make sure a route navigation closes the sidebar
    $route: 'closeMobileSidebar',
    width: {
      immediate: true,
      handler: debounce(function widthHandler(value) {
        this.emitEventChange(value);
      }, 250, true, true),
    },
    windowWidth: 'getWidthInCheck',
    breakpoint: 'getWidthInCheck',
  },
  methods: {
    getWidthInCheck: debounce(function getWidthInCheck() {
      // make sure sidebar is never wider than the windowWidth
      if (this.width > this.maxWidth) {
        this.width = this.maxWidth;
      } else if (this.width < this.minWidth) {
        this.width = this.minWidth;
      }
    }, 50),
    onEscapeClick({ key }) {
      if (key === 'Escape') this.closeMobileSidebar();
    },
    async storeWindowSize() {
      await this.$nextTick();
      this.windowWidth = window.innerWidth;
    },
    closeMobileSidebar() {
      if (!this.openExternally) return;
      this.$emit('update:openExternally', false);
    },
    startDrag({ type }) {
      this.isTouch = type === 'touchstart';
      if (this.isDragging) return;
      this.isDragging = true;
      document.addEventListener(this.events.move, this.handleDrag, { passive: this.isTouch });
      document.addEventListener(this.events.end, this.stopDrag);
    },
    /**
     * Handle dragging the resize element
     * @param {MouseEvent|TouchEvent} e
     */
    handleDrag(e) {
      if (!this.isTouch) e.preventDefault();
      // we don't want to do anything if we aren't resizing.
      if (!this.isDragging) return;
      const { sidebar } = this.$refs;
      const clientX = this.isTouch ? e.touches[0].clientX : e.clientX;
      let newWidth = (clientX - sidebar.offsetLeft);
      // prevent going outside of the window zone
      if (newWidth > this.maxWidth) {
        newWidth = this.maxWidth;
      }
      // prevent from shrinking too much
      this.width = Math.max(newWidth, this.minWidth);
    },
    /**
     * Stop the dragging upon mouse up
     * @param {MouseEvent} e
     */
    stopDrag(e) {
      e.preventDefault();
      if (!this.isDragging) return;
      this.isDragging = false;
      storage.set(STORAGE_KEY, this.width);
      document.removeEventListener(this.events.move, this.handleDrag);
      document.removeEventListener(this.events.end, this.stopDrag);
      // emit the width, in case the debounce muted the last change
      this.emitEventChange(this.width);
    },
    emitEventChange(width) {
      this.$emit('width-change', width);
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.adjustable-sidebar-width {
  display: flex;
  @include breakpoint(small) {
    display: block;
    position: relative;
  }
}

.sidebar {
  position: relative;
  @include breakpoint(small) {
    position: static;
  }
}

.aside {
  width: 250px;
  position: relative;
  height: 100%;
  max-width: 100vw;

  @include breakpoint(small) {
    width: 0 !important;
    min-width: 0;
    max-width: 100%;
    position: fixed;
    top: 0;
    bottom: 0;
    z-index: 9999;
    transform: translateX(-100px);
    transition: width 0.15s linear, transform 0.15s ease-in;

    &.force-open {
      width: 100% !important;
      transform: translateX(0);
    }
  }
}

.content {
  display: flex;
  flex-flow: column;
  min-width: 0;
  flex: 1 1 auto;
  height: 100%;
}

.resize-handle {
  position: absolute;
  cursor: col-resize;
  top: 0;
  bottom: 0;
  right: 0;
  width: 5px;
  height: 100%;
  user-select: none;
  z-index: 1;
  transition: background-color .15s;
  transform: translateX(50%);

  .fully-closed &, .fully-open & {
    width: 10px;
  }

  @include breakpoint(small) {
    display: none;
  }

  &:hover {
    background: var(--color-fill-gray-tertiary);
  }
}
</style>
