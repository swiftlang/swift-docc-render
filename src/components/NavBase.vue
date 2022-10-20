<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <nav
    class="nav"
    :class="rootClasses"
    role="navigation"
    ref="nav"
  >
    <div class="nav__wrapper" ref="wrapper">
      <div class="nav__background" />
      <div v-if="hasOverlay" class="nav-overlay" @click="closeNav" />
      <div class="nav-content">
        <div class="pre-title">
          <slot name="pre-title" v-bind="{ closeNav, inBreakpoint, currentBreakpoint, isOpen }" />
        </div>
        <div v-if="$slots.default" class="nav-title">
          <slot />
        </div>
        <slot name="after-title" />
        <div class="nav-menu">
          <a
            href="#"
            class="nav-ax-toggle"
            ref="axToggle"
            role="button"
            @click.prevent="toggleNav"
          >
            <span class="visuallyhidden">
              <template v-if="!isOpen">Open Menu</template>
              <template v-else>Close Menu</template>
            </span>
          </a>
          <div
            ref="tray"
            class="nav-menu-tray"
            @transitionend.self="onTransitionEnd"
            @click="handleTrayClick"
          >
            <slot name="tray" :closeNav="closeNav">
              <NavMenuItems>
                <slot name="menu-items" />
              </NavMenuItems>
            </slot>
          </div>
        </div>
        <div class="nav-actions">
          <a
            ref="toggle"
            href="#"
            class="nav-menucta"
            tabindex="-1"
            @click.prevent="toggleNav"
            aria-hidden="true"
          >
            <span class="nav-menucta-chevron" />
          </a>
        </div>
      </div>
      <slot name="after-content" />
    </div>
    <BreakpointEmitter :scope="BreakpointScopes.nav" @change="onBreakpointChange" />
  </nav>
</template>

<script>
import onIntersect from 'docc-render/mixins/onIntersect';
import NavMenuItems from 'docc-render/components/NavMenuItems.vue';
import BreakpointEmitter from 'docc-render/components/BreakpointEmitter.vue';

import scrollLock from 'docc-render/utils/scroll-lock';
import { baseNavStickyAnchorId, MenuLinkModifierClasses } from 'docc-render/constants/nav';
import { isBreakpointAbove } from 'docc-render/utils/breakpoints';
import changeElementVOVisibility from 'docc-render/utils/changeElementVOVisibility';
import { waitFrames } from 'docc-render/utils/loading';

const { noClose } = MenuLinkModifierClasses;
const { BreakpointName, BreakpointScopes } = BreakpointEmitter.constants;

const NoBGTransitionFrames = 8;

const NavStateClasses = {
  isDark: 'theme-dark',
  isOpen: 'nav--is-open',
  inBreakpoint: 'nav--in-breakpoint-range',
  isTransitioning: 'nav--is-transitioning',
  isSticking: 'nav--is-sticking',
  hasSolidBackground: 'nav--solid-background',
  hasNoBorder: 'nav--noborder',
  hasFullWidthBorder: 'nav--fullwidth-border',
  isWideFormat: 'nav--is-wide-format',
  noBackgroundTransition: 'nav--no-bg-transition',
};

export default {
  name: 'NavBase',
  components: { NavMenuItems, BreakpointEmitter },
  constants: { NavStateClasses, NoBGTransitionFrames },
  props: {
    /**
     * At which breakpoint size should the nav transform to a mobile friendly navigation.
     * It's mostly set to `small` with the Documentation pages being an exception with `medium`.
     */
    breakpoint: {
      type: String,
      default: BreakpointName.small,
    },
    /**
     * Should the mobile navigation render a dark overlay when opened.
     */
    hasOverlay: {
      type: Boolean,
      default: true,
    },
    /**
     * Whether the navigation has a constant solid background, without transparency or blur.
     */
    hasSolidBackground: {
      type: Boolean,
      default: false,
    },
    /**
     * Whether the navigation has a bottom border
     */
    hasNoBorder: {
      type: Boolean,
      default: false,
    },
    hasFullWidthBorder: {
      type: Boolean,
      default: false,
    },
    isDark: {
      type: Boolean,
      default: false,
    },
    isWideFormat: {
      type: Boolean,
      default: false,
    },
  },
  mixins: [onIntersect],
  data() {
    return {
      isOpen: false,
      isTransitioning: false,
      isSticking: false,
      noBackgroundTransition: true,
      currentBreakpoint: BreakpointName.large,
    };
  },
  computed: {
    BreakpointScopes: () => BreakpointScopes,
    inBreakpoint: ({ currentBreakpoint, breakpoint }) => (
      !isBreakpointAbove(currentBreakpoint, breakpoint)
    ),
    rootClasses: ({
      isOpen, inBreakpoint, isTransitioning, isSticking, hasSolidBackground,
      hasNoBorder, hasFullWidthBorder, isDark, isWideFormat, noBackgroundTransition,
    }) => ({
      [NavStateClasses.isDark]: isDark,
      [NavStateClasses.isOpen]: isOpen,
      [NavStateClasses.inBreakpoint]: inBreakpoint,
      [NavStateClasses.isTransitioning]: isTransitioning,
      [NavStateClasses.isSticking]: isSticking,
      [NavStateClasses.hasSolidBackground]: hasSolidBackground,
      [NavStateClasses.hasNoBorder]: hasNoBorder,
      [NavStateClasses.hasFullWidthBorder]: hasFullWidthBorder,
      [NavStateClasses.isWideFormat]: isWideFormat,
      [NavStateClasses.noBackgroundTransition]: noBackgroundTransition,
    }),
  },
  watch: {
    isOpen(value) {
      this.$emit('change', value);
      if (value) {
        this.onExpand();
      } else {
        this.onClose();
      }
    },
  },
  async mounted() {
    window.addEventListener('keydown', this.onEscape);
    window.addEventListener('popstate', this.closeNav);
    window.addEventListener('orientationchange', this.closeNav);
    document.addEventListener('click', this.handleClickOutside);
    this.handleFlashOnMount();
    await this.$nextTick();
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onEscape);
    window.removeEventListener('popstate', this.closeNav);
    window.removeEventListener('orientationchange', this.closeNav);
    document.removeEventListener('click', this.handleClickOutside);
    if (this.isOpen) {
      this.toggleScrollLock(false);
    }
  },
  methods: {
    getIntersectionTargets() {
      return [document.getElementById(baseNavStickyAnchorId) || this.$el];
    },
    toggleNav() {
      this.isOpen = !this.isOpen;
      this.isTransitioning = true;
    },
    closeNav() {
      const oldValue = this.isOpen;
      // close the nav
      this.isOpen = false;
      // return a promise, that resolves when transitions end
      return this.resolveOnceTransitionsEnd(oldValue);
    },
    resolveOnceTransitionsEnd(oldIsOpen) {
      // if outside the breakpoint, or was already closed, resolve as there is no tray animation
      if (!oldIsOpen || !this.inBreakpoint) return Promise.resolve();
      // enable the transitioning up tracking
      this.isTransitioning = true;
      // resolve a promise, when we stop transitioning
      return new Promise((resolve) => {
        const unwatch = this.$watch('isTransitioning', () => {
          resolve();
          unwatch();
        });
      });
    },
    /**
     * When the closing animation ends,
     * allow the menu on mobile to be scrollable.
     */
    async onTransitionEnd({ propertyName }) {
      if (propertyName !== 'max-height') return;
      this.$emit('changed', this.isOpen);
      this.isTransitioning = false;
      if (this.isOpen) {
        this.$emit('opened');
        // toggle the scroll lock on/off if needed
        this.toggleScrollLock(true);
      } else {
        this.$emit('closed');
      }
    },
    /**
     * Detect if the nav is inside the desired breakpoint
     * @param breakpoint
     */
    onBreakpointChange(breakpoint) {
      this.currentBreakpoint = breakpoint;
      // close the nav if outside of the breakpoint
      if (!this.inBreakpoint) this.closeNav();
    },
    /**
     * On every intersection change
     * update the `is-sticking` class.
     * @param {IntersectionObserverEntry} entry
     * @param {Number} entry.intersectionRatio
     */
    onIntersect({ intersectionRatio }) {
      // if the page is pulled down, the elastic effect can cause false results
      if (window.scrollY < 0) return;
      // If nav is sticking to the top,
      // the ratio is below 1, because its outside the 1px margin.
      this.isSticking = intersectionRatio !== 1;
    },
    /**
     * On Escape, close the nav and focus the AX Toggle.
     */
    onEscape({ key }) {
      // react only to escape key and when its expanded
      if (key === 'Escape' && this.isOpen) {
        this.closeNav();
        this.$refs.axToggle.focus();
      }
    },
    /**
     * Handle clicks on the tray or any element inside it
     * @param {Event} event
     * @param {EventTarget} event.target
     */
    handleTrayClick({ target }) {
      // If the target is a link and has a `href` property, close the nav.
      // Targets can opt out of this default behavior with the "noclose" class.
      if (target.href && !target.classList.contains(noClose)) {
        this.closeNav();
      }
    },
    /**
     * Closes the nav, if clicking outside of it.
     * @param {EventTarget} target
     */
    handleClickOutside({ target }) {
      if (this.$refs.nav.contains(target)) return;
      this.closeNav();
    },
    /**
     * Toggles the scroll lock on/off,
     * only if the tray is scrollable in Y.
     */
    toggleScrollLock(lock) {
      if (lock) {
        scrollLock.lockScroll(this.$refs.tray);
      } else {
        scrollLock.unlockScroll(this.$refs.tray);
      }
    },
    onExpand() {
      this.$emit('open');
      // hide sibling elements from VO
      changeElementVOVisibility.hide(this.$refs.wrapper);
      if (document.activeElement === this.$refs.toggle) {
        // move focus to body to prevent tabbing to links in body
        // when toggle is triggered by mouse
        document.activeElement.blur();
      }
    },
    onClose() {
      this.$emit('close');
      // stop the scroll lock
      this.toggleScrollLock(false);
      changeElementVOVisibility.show(this.$refs.wrapper);
    },
    async handleFlashOnMount() {
      await waitFrames(NoBGTransitionFrames);
      this.noBackgroundTransition = false;
    },
  },
};
</script>

<style lang='scss' scoped>
@import "docc-render/styles/_core.scss";

@mixin nav-keyline-color($color) {
  &:after {
    background-color: $color;
  }
}

$content-max-width: map-deep-get($breakpoint-attributes, (nav, large, content-width));

.nav {
  position: sticky;
  top: 0;
  width: 100%;
  height: $nav-height;
  z-index: $nav-z-index;
  --nav-padding: #{$nav-padding};

  @media print {
    position: relative;
  }

  @include breakpoint(small, $scope: nav) {
    min-width: map-deep-get($breakpoint-attributes, (nav, small, min-width));
    height: $nav-height-small;
  }

  color: var(--color-nav-color);

  @include nav-dark($nested: true) {
    background: none;
    color: var(--color-nav-dark-color);
  }

  &__wrapper {
    position: absolute;
    top: 0;
    left: 0;
    width: 100%;
    height: auto;
    min-height: 100%;
    z-index: 1;
  }

  &__background {
    @include nav-keyline-color(var(--color-nav-keyline));
    position: absolute;
    left: 0;
    top: 0;
    width: 100%;
    height: 100%;
    z-index: 1;
    transition: background-color $nav-bg-color-transition;

    // apply a no-transition, for cases where the nav is sticked at page load,
    // removes a nasty flash in the background.
    .nav--no-bg-transition & {
      transition: none !important;
    }

    // nav has a solid fill background
    @include unify-selector('.nav--solid-background') {
      background-color: var(--color-nav-solid-background);
      backdrop-filter: none;
      @include nav-is-sticking($nested: true) {
        background-color: var(--color-nav-solid-background);
      }
      @include nav-is-open($nested: true) {
        background-color: var(--color-nav-solid-background);
      }

      @include nav-dark($nested: true) {
        background-color: var(--color-nav-dark-solid-background);
        @include nav-is-sticking($nested: true) {
          background-color: var(--color-nav-dark-solid-background);
        }
        @include nav-is-open($nested: true) {
          background-color: var(--color-nav-dark-solid-background);
        }
      }
    }

    // nav is collapsed
    @include nav-in-breakpoint {
      min-height: $nav-height-small;
      transition: background-color $nav-bg-transition-timing ease 0.7s;
    }

    // nav is sticky
    @include nav-is-sticking {
      @include nav-keyline-color(var(--color-nav-sticking-expanded-keyline));
      background-color: var(--color-nav-expanded);
      max-height: none;
      transition: background-color $nav-bg-transition-timing ease;
      transition-property: background-color, backdrop-filter;

      @supports (backdrop-filter: initial) {
        @include backdrop-filter-uiblur;
        background-color: var(--color-nav-uiblur-stuck);
      }

      // sticky and dark mode
      @include nav-dark($nested: true) {
        background-color: var(--color-nav-dark-stuck);

        @supports (backdrop-filter: initial) {
          background-color: var(--color-nav-dark-uiblur-stuck);
        }
      }
    }

    // nav is expanded
    @include nav-is-open {
      @include nav-keyline-color(var(--color-nav-sticking-expanded-keyline));
      background-color: var(--color-nav-expanded);
      max-height: none;
      transition: background-color $nav-bg-transition-timing ease;
      transition-property: background-color, backdrop-filter;

      @supports (backdrop-filter: initial) {
        @include backdrop-filter-uiblur;
        background-color: var(--color-nav-uiblur-expanded);
      }

      @include nav-dark($nested: true) {
        background-color: var(--color-nav-dark-expanded);

        @supports (backdrop-filter: initial) {
          background-color: var(--color-nav-dark-uiblur-expanded);
        }
      }
    }

    // in dark mode
    @include nav-dark {
      @include nav-keyline-color(var(--color-nav-dark-keyline));

      @include nav-is-sticking($nested: true) {
        @include nav-keyline-color(var(--color-nav-dark-sticking-expanded-keyline));
      }

      @include nav-is-open($nested: true) {
        @include nav-keyline-color(var(--color-nav-dark-sticking-expanded-keyline));
      }
    }

    // the border under the nav
    &:after {
      content: "";
      display: block;
      position: absolute;
      top: 100%;
      left: 50%;
      transform: translateX(-50%);
      width: $content-max-width;
      height: 1px;
      z-index: 1;
      @include breakpoint(medium, $scope: nav) {
        width: 100%;
      }

      @include unify-selector('.nav--noborder') {
        display: none;

        @include nav-is-sticking($nested: true) {
          display: block;
        }
      }

      @include unify-selector('.nav--fullwidth-border') {
        width: 100%;
      }

      @include nav-is-sticking {
        width: 100%;
      }

      @include nav-is-open {
        width: 100%;
      }

      .nav--solid-background & {
        width: 100%;
      }
    }
  }
}

// Nav overlay when collapsed and expanded
.nav-overlay {
  position: fixed;
  left: 0;
  right: 0;
  top: 0;
  display: block;
  opacity: 0;

  // when the nav is expanded
  @include nav-is-open {
    background-color: rgba(51, 51, 51, 0.4);
    transition: opacity 0.7s $nav-items-timingfunction 0.2s;
    bottom: 0;
    opacity: 1;
  }
}

.nav-wrapper {
  position: absolute;
  top: 0;
  left: 0;
  width: 100%;
  height: auto;
  min-height: 100%;
  z-index: 1;
}

.pre-title {
  display: flex;
  overflow: hidden;
  padding-left: $nav-padding;
  margin-left: -$nav-padding;

  &:empty {
    display: none;
  }

  @include nav-in-breakpoint() {
    overflow: visible;
    padding: 0;
    margin-left: 0;
  }
}

// Nav content (title and menus)
.nav-content {
  display: flex;
  padding: 0 var(--nav-padding);
  max-width: $content-max-width;
  margin: 0 auto;
  position: relative;
  z-index: 2;
  justify-content: space-between;

  @include nav-is-wide-format() {
    box-sizing: border-box;
    @include breakpoint-full-width-container()
  }

  // Fix iPhone Notch issues
  @supports (padding:calc(max(0px))) {
    padding-left: calc(max(var(--nav-padding), env(safe-area-inset-left)));
    padding-right: calc(max(var(--nav-padding), env(safe-area-inset-right)));
  }

  @include breakpoint(small, $scope: nav) {
    padding: 0 0 0 $nav-padding-small;
  }

  @include nav-in-breakpoint {
    display: grid;
    grid-template-columns: auto 1fr auto;
    grid-auto-rows: minmax(min-content, max-content);
    grid-template-areas:
      "pre-title title actions"
      "menu menu menu";
  }
}

.nav-menu {
  @include font-styles(nav-menu);
  flex: 1 1 auto;
  display: flex;
  // padding centers it vertically for large resolutions
  padding-top: 10px;
  min-width: 0;

  @include nav-in-breakpoint {
    @include font-styles(nav-menu-collapsible);
    // it is collapsed, so we no longer need the offset
    padding-top: 0;
    grid-area: menu;
  }
}

.nav-menu-tray {
  width: 100%;
  max-width: 100%;
  align-items: center;
  display: flex;
  justify-content: space-between;

  @include nav-in-breakpoint {
    display: block;
    overflow: hidden;
    pointer-events: none;
    visibility: hidden;
    max-height: 0;
    transition: $nav-menu-tray-transition;

    @include nav-is-open($nested: true) {
      $max-height: calc(100vh - #{$nav-height-small} - #{$nav-height-small});

      max-height: $max-height;
      overflow-y: auto;
      -webkit-overflow-scrolling: touch;
      pointer-events: auto;
      visibility: visible;
      transition-delay: 0.2s, 0s;

      @include unify-selector('.nav--is-transitioning', $nested: true) {
        overflow-y: hidden;
      }

      @include nav-is-sticking($nested: true) {
        max-height: calc(100vh - #{$nav-height-small});
      }
    }
  }
}

.nav-actions {
  display: flex;
  align-items: center;

  @include nav-in-breakpoint {
    grid-area: actions;
    justify-content: flex-end;
  }
  @include breakpoint(small, nav) {
    padding-right: $nav-padding-small;
  }
}

.nav-title {
  height: $nav-height;
  @include font-styles(nav-title);
  cursor: default;
  display: flex;
  align-items: center;
  white-space: nowrap;
  box-sizing: border-box;

  @include breakpoint(small, $scope: nav) {
    padding-top: 0;
    height: $nav-height-small;
    width: 90%;
  }

  @include nav-in-breakpoint {
    grid-area: title;

    @include nav-is-wide-format(true) {
      width: 100%;
      justify-content: center;
    }
  }

  /deep/ span {
    height: 100%;
    line-height: initial;
  }

  a {
    display: inline-block;
    letter-spacing: inherit;
    line-height: initial;
    margin: 0;
    text-decoration: none;
    white-space: nowrap;

    &:hover {
      text-decoration: none;
    }

    @include breakpoint(small, $scope: nav) {
      display: flex;
    }
  }

  &, a {
    color: var(--color-figure-gray);
    transition: color $nav-bg-color-transition;

    @include nav-dark {
      color: var(--color-nav-dark-link-color);

      @include nav-is-sticking($nested: true) {
        color: var(--color-nav-dark-link-color);
      }

      @include nav-is-open($nested: true) {
        color: var(--color-nav-dark-link-color);
      }
    }
  }
}

// element used only with screen readers,
// toggles the nav on/off
.nav-ax-toggle {
  display: none;
  position: absolute;
  top: 0;
  left: 0;
  width: 1px;
  height: 1px;
  z-index: 10;

  // when in focus, spread out across the entire navigation
  &:focus {
    outline-offset: -6px;
    width: 100%;
    height: 100%;
  }

  // make sure its only visible to VO, in the collapse range.
  @include nav-in-breakpoint {
    display: block;
  }
}

.nav-menucta {
  cursor: pointer;
  display: none;
  align-items: center;
  overflow: hidden;
  width: rem(20px);
  -webkit-tap-highlight-color: transparent;
  height: $nav-height-small;

  @include nav-in-breakpoint {
    display: flex;
  }

  &-chevron {
    display: block;
    position: relative;
    width: 100%;
    height: rem(12px);
    transition: $nav-chevron-transition;

    &::before,
    &::after {
      content: "";
      display: block;
      position: absolute;
      top: rem(10px);
      width: rem(12px);
      height: rem(1px);
      transition: $nav-chevron-transition;
      background: var(--color-figure-gray);
    }

    &::before {
      right: 50%;
      border-radius: .5px 0 0 .5px;
      transform: rotate(#{$nav-chevron-angle}) scaleY($nav-chevron-thickness);
    }

    &::after {
      left: 50%;
      border-radius: 0 .5px .5px 0;
      transform: rotate(-#{$nav-chevron-angle}) scaleY($nav-chevron-thickness);
    }

    @include nav-chevron-animation;

    @include nav-dark {
      &::before,
      &::after {
        background: var(--color-nav-dark-link-color);
      }
    }
  }
}

// Applies colors to any link inside the nav
/deep/ .nav-menu-link {
  color: var(--color-nav-link-color);

  &:hover {
    color: var(--color-nav-link-color-hover);
    text-decoration: none;
  }

  @include nav-dark {
    color: var(--color-nav-dark-link-color);

    &:hover {
      color: var(--color-nav-dark-link-color-hover);
    }
  }

  &.current {
    color: var(--color-nav-current-link);
    cursor: default;

    &:hover {
      color: var(--color-nav-current-link);
    }

    @include nav-dark {
      color: var(--color-nav-dark-current-link);

      &:hover {
        color: var(--color-nav-dark-current-link);
      }
    }
  }
}

</style>
