<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="adjustable-sidebar-width"
    :class="{
      dragging: isDragging,
      'sidebar-hidden': hiddenOnLarge
    }"
  >
    <div
      ref="sidebar"
      class="sidebar"
    >
      <div
        :class="asideClasses"
        :style="asideStyles"
        class="aside"
        ref="aside"
        :aria-hidden="hiddenOnLarge ? 'true': null"
        @transitionstart.self="trackTransitionStart"
        @transitionend.self="trackTransitionEnd"
      >
        <slot
          name="aside"
          animationClass="aside-animated-child"
          :scrollLockID="scrollLockID"
          :breakpoint="breakpoint"
        />
      </div>
      <div
        v-if="!fixedWidth"
        class="resize-handle"
        @mousedown.prevent="startDrag"
        @touchstart.prevent="startDrag"
      />
    </div>
    <div class="content" ref="content">
      <slot />
    </div>
    <BreakpointEmitter :scope="BreakpointScopes.nav" @change="breakpoint = $event" />
  </div>
</template>

<script>
import { storage } from 'docc-render/utils/storage';
import debounce from 'docc-render/utils/debounce';
import BreakpointEmitter from 'docc-render/components/BreakpointEmitter.vue';
import { BreakpointName, BreakpointScopes } from 'docc-render/utils/breakpoints';
import { waitFrames } from 'docc-render/utils/loading';
import scrollLock from 'docc-render/utils/scroll-lock';
import FocusTrap from 'docc-render/utils/FocusTrap';
import changeElementVOVisibility from 'docc-render/utils/changeElementVOVisibility';
import throttle from 'docc-render/utils/throttle';
import { baseNavStickyAnchorId } from 'docc-render/constants/nav';

export const STORAGE_KEY = 'sidebar';

// the maximum width, after which the full-width content does not grow
export const MAX_WIDTH = 1920;
export const ULTRA_WIDE_DEFAULT = 543;

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

const SCROLL_LOCK_ID = 'sidebar-scroll-lock';

export default {
  name: 'AdjustableSidebarWidth',
  constants: {
    SCROLL_LOCK_ID,
  },
  components: {
    BreakpointEmitter,
  },
  inject: ['store'],
  props: {
    shownOnMobile: {
      type: Boolean,
      default: false,
    },
    hiddenOnLarge: {
      type: Boolean,
      default: false,
    },
    fixedWidth: {
      type: Number,
      default: null,
    },
  },
  data() {
    const windowWidth = window.innerWidth;
    const windowHeight = window.innerHeight;
    const breakpoint = BreakpointName.large;
    // get the min width, in case we dont have a previously saved value
    const minWidth = calcWidthPercent(minWidthResponsivePercents[breakpoint]);
    // calc the maximum width
    const maxWidth = calcWidthPercent(maxWidthResponsivePercents[breakpoint]);
    // have a default width for very large screens, or use half of the min and max
    const defaultWidth = windowWidth >= MAX_WIDTH
      ? ULTRA_WIDE_DEFAULT
      : Math.round((minWidth + maxWidth) / 2);
    // get the already stored data, fallback to a default one.
    const storedWidth = storage.get(STORAGE_KEY, defaultWidth);
    return {
      isDragging: false,
      // limit the width to a range
      width: this.fixedWidth || Math.min(Math.max(storedWidth, minWidth), maxWidth),
      isTouch: false,
      windowWidth,
      windowHeight,
      breakpoint,
      noTransition: false,
      isTransitioning: false,
      isOpeningOnLarge: false,
      focusTrapInstance: null,
      mobileTopOffset: 0,
      topOffset: 0,
    };
  },
  computed: {
    minWidthPercent: ({ breakpoint }) => minWidthResponsivePercents[breakpoint] || 0,
    maxWidthPercent: ({ breakpoint }) => maxWidthResponsivePercents[breakpoint] || 100,
    maxWidth: ({ maxWidthPercent, windowWidth, fixedWidth }) => (
      Math.max(fixedWidth, calcWidthPercent(maxWidthPercent, windowWidth))
    ),
    minWidth: ({ minWidthPercent, windowWidth, fixedWidth }) => (
      Math.min(fixedWidth || windowWidth, calcWidthPercent(minWidthPercent, windowWidth))
    ),
    widthInPx: ({ width }) => `${width}px`,
    // Point at which, the nav is hidden/shown for large, when dragging.
    hiddenOnLargeThreshold: ({ minWidth }) => minWidth / 2,
    events: ({ isTouch }) => (isTouch ? eventsMap.touch : eventsMap.mouse),
    asideStyles: ({
      widthInPx, mobileTopOffset, topOffset, windowHeight,
    }) => ({
      width: widthInPx,
      '--top-offset': topOffset ? `${topOffset}px` : null,
      '--top-offset-mobile': `${mobileTopOffset}px`,
      '--app-height': `${windowHeight}px`,
    }),
    asideClasses: ({
      isDragging, shownOnMobile, noTransition, isTransitioning,
      hiddenOnLarge, mobileTopOffset, isOpeningOnLarge,
    }) => ({
      dragging: isDragging,
      'show-on-mobile': shownOnMobile,
      'hide-on-large': hiddenOnLarge,
      'is-opening-on-large': isOpeningOnLarge,
      'no-transition': noTransition,
      'sidebar-transitioning': isTransitioning,
      'has-mobile-top-offset': mobileTopOffset,
    }),
    scrollLockID: () => SCROLL_LOCK_ID,
    BreakpointScopes: () => BreakpointScopes,
  },
  async mounted() {
    window.addEventListener('keydown', this.onEscapeKeydown);
    window.addEventListener('resize', this.storeWindowSize, { passive: true });
    window.addEventListener('orientationchange', this.storeWindowSize, { passive: true });

    this.storeTopOffset();
    if (!(this.topOffset === 0 && window.scrollY === 0)) {
      window.addEventListener('scroll', this.storeTopOffset, { passive: true });
    }

    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('keydown', this.onEscapeKeydown);
      window.removeEventListener('resize', this.storeWindowSize);
      window.removeEventListener('orientationchange', this.storeWindowSize);
      window.removeEventListener('scroll', this.storeTopOffset);
      if (this.shownOnMobile) {
        this.toggleScrollLock(false);
      }
      if (this.focusTrapInstance) this.focusTrapInstance.destroy();
    });

    await this.$nextTick();
    this.focusTrapInstance = new FocusTrap(this.$refs.aside);
  },
  watch: {
    // make sure a route navigation closes the sidebar
    $route: 'closeMobileSidebar',
    width: {
      immediate: true,
      handler: throttle(function widthHandler(value) {
        this.emitEventChange(value);
      }, 150),
    },
    windowWidth: 'getWidthInCheck',
    async breakpoint(value) {
      // adjust the width, so it does not go outside of limits
      this.getWidthInCheck();
      // make sure we close the nav
      if (value === BreakpointName.large) {
        this.closeMobileSidebar();
      }
      // make sure we dont apply transitions for a few moments, to prevent flashes
      this.noTransition = true;
      // await for a few moments
      await waitFrames(5);
      // re-apply transitions
      this.noTransition = false;
    },
    shownOnMobile: 'handleExternalOpen',
    isTransitioning(value) {
      if (!value) this.updateContentWidthInStore();
    },
    hiddenOnLarge() {
      this.isTransitioning = true;
    },
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
    onEscapeKeydown({ key }) {
      if (key === 'Escape') this.closeMobileSidebar();
    },
    storeWindowSize: throttle(async function storeWindowSize() {
      await this.$nextTick();
      this.windowWidth = window.innerWidth;
      this.windowHeight = window.innerHeight;
      this.updateContentWidthInStore();
    }, 100),
    closeMobileSidebar() {
      if (!this.shownOnMobile) return;
      this.$emit('update:shownOnMobile', false);
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
      // make sure we add the window horizontal scroll to the touch position, fixes zoomed in iOS
      let newWidth = ((clientX + window.scrollX) - sidebar.offsetLeft);
      // prevent going outside of the window zone
      if (newWidth > this.maxWidth) {
        newWidth = this.maxWidth;
      }
      // if we are going beyond the cutoff point and we are closed, open the navigator
      if (this.hiddenOnLarge && newWidth >= this.hiddenOnLargeThreshold) {
        this.$emit('update:hiddenOnLarge', false);
        this.isOpeningOnLarge = true;
      }
      // prevent from shrinking too much
      this.width = Math.max(newWidth, this.minWidth);
      // if the new width is smaller than the cutoff point, force close the nav
      if (newWidth <= this.hiddenOnLargeThreshold) {
        this.$emit('update:hiddenOnLarge', true);
      }
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
      this.updateContentWidthInStore();
    },
    getTopOffset() {
      const stickyNavAnchor = document.getElementById(baseNavStickyAnchorId);
      if (!stickyNavAnchor) return 0;
      const { y } = stickyNavAnchor.getBoundingClientRect();
      return Math.max(y, 0);
    },
    handleExternalOpen(isOpen) {
      if (isOpen) {
        this.mobileTopOffset = this.getTopOffset();
      }
      this.toggleScrollLock(isOpen);
    },
    async updateContentWidthInStore() {
      await this.$nextTick();
      this.store.setContentWidth(this.$refs.content.offsetWidth);
    },
    /**
     * Toggles the scroll lock on/off
     */
    async toggleScrollLock(lock) {
      const scrollLockContainer = document.getElementById(this.scrollLockID);
      if (lock) {
        await this.$nextTick();
        scrollLock.lockScroll(scrollLockContainer);
        // lock focus
        this.focusTrapInstance.start();
        // hide sibling elements from VO
        changeElementVOVisibility.hide(this.$refs.aside);
      } else {
        scrollLock.unlockScroll(scrollLockContainer);
        this.focusTrapInstance.stop();
        changeElementVOVisibility.show(this.$refs.aside);
      }
    },
    storeTopOffset: throttle(function storeTopOffset() {
      this.topOffset = this.getTopOffset();
    }, 60),
    trackTransitionStart({ propertyName }) {
      if (propertyName === 'width' || propertyName === 'transform') {
        this.isTransitioning = true;
      }
    },
    trackTransitionEnd({ propertyName }) {
      if (propertyName === 'width' || propertyName === 'transform') {
        this.isTransitioning = false;
        this.isOpeningOnLarge = false;
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

@media print {
  .sidebar {
    display: none;
  }
}

.adjustable-sidebar-width {
  display: flex;
  @include breakpoint(medium, nav) {
    display: block;
    position: relative;
  }

  &.dragging /deep/ * {
    cursor: col-resize !important;
  }

  &.sidebar-hidden.dragging /deep/ * {
    cursor: e-resize !important;
  }
}

.sidebar {
  position: relative;
  @include breakpoint(medium, nav) {
    position: static;
  }
}

.aside {
  width: 250px;
  position: relative;
  height: 100%;
  max-width: 100vw;

  &.no-transition {
    transition: none !important;
  }

  @include breakpoints-from(large, nav) {
    // apply a default transition
    transition: width $adjustable-sidebar-hide-transition-duration ease-in,
    visibility 0s linear var(--visibility-transition-time, 0s);

    // Remove the transition when dragging, except when hidden or exiting hidden state.
    // This prevents lagging when dragging, because of the transition delay.
    &.dragging:not(.is-opening-on-large):not(.hide-on-large) {
      transition: none;
    }

    &.hide-on-large {
      width: 0 !important;
      visibility: hidden;
      pointer-events: none;
      --visibility-transition-time: #{$adjustable-sidebar-hide-transition-duration};
    }
  }

  @include breakpoint(medium, nav) {
    width: 100% !important;
    overflow: hidden;
    min-width: 0;
    max-width: 100%;
    height: calc(var(--app-height) - var(--top-offset-mobile));
    position: fixed;
    top: var(--top-offset-mobile);
    bottom: 0;
    left: 0;
    z-index: $nav-z-index + 1;
    transform: translateX(-100%);
    transition: transform 0.15s ease-in;
    left: 0;

    /deep/ .aside-animated-child {
      opacity: 0;
    }

    &.show-on-mobile {
      transform: translateX(0);

      /deep/ .aside-animated-child {
        --index: 0;
        opacity: 1;
        transition: opacity 0.15s linear;
        transition-delay: calc(var(--index) * 0.15s + 0.15s);
      }
    }

    &.has-mobile-top-offset {
      border-top: 1px solid var(--color-fill-gray-tertiary);
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

  @include breakpoint(medium, nav) {
    display: none;
  }

  &:hover {
    background: var(--color-fill-gray-tertiary);
  }
}
</style>
