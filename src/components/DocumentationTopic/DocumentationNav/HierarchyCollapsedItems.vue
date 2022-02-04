<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <li class="hierarchy-collapsed-items">
    <span class="hierarchy-item-icon icon-inline">/</span>
    <button
      class="toggle"
      ref="btn"
      :class="{ focused: !collapsed }"
      @click="toggleCollapsed"
    >
      <span class="indicator"><EllipsisIcon class="icon-inline toggle-icon" /></span>
    </button>
    <ul class="dropdown" ref="dropdown" :class="{ collapsed }">
      <li v-for="topic in topicsWithUrls" class="dropdown-item" :key="topic.title">
        <router-link class="nav-menu-link" :to="topic.url">{{ topic.title }}</router-link>
      </li>
    </ul>
  </li>
</template>

<script>
import { buildUrl } from 'docc-render/utils/url-helper';
import EllipsisIcon from 'theme/components/Icons/EllipsisIcon.vue';

export default {
  name: 'HierarchyCollapsedItems',
  components: { EllipsisIcon },
  data: () => ({ collapsed: true }),
  props: {
    topics: {
      type: Array,
      required: true,
    },
  },
  watch: {
    collapsed(isCollapsed, wasCollapsed) {
      if (wasCollapsed && !isCollapsed) {
        // listen for "click" anywhere on page when dropdown is uncollapsed so
        // it can easily be dismissed by clicking elsewhere
        document.addEventListener('click', this.handleDocumentClick, false);
      } else if (!wasCollapsed && isCollapsed) {
        // remove global "click" listener once the dropdown has been collapsed
        document.removeEventListener('click', this.handleDocumentClick, false);
      }
    },
  },
  beforeDestroy() {
    // ensure global "click" listener never lingers beyond life of instance
    document.removeEventListener('click', this.handleDocumentClick, false);
  },
  computed: {
    topicsWithUrls: ({
      $route,
      topics,
    }) => topics.map(topic => ({
      ...topic,
      url: buildUrl(topic.url, $route.query),
    })),
  },
  methods: {
    handleDocumentClick(event) {
      const { target } = event;
      const {
        collapsed,
        $refs: { btn, dropdown },
      } = this;

      // When the dropdown is uncollapsed and there is a click away from this
      // button/dropdown element, go ahead and collapse it.
      const clickedAway = !btn.contains(target) && !dropdown.contains(target);
      if (!collapsed && clickedAway) {
        this.collapsed = true;
      }
    },
    toggleCollapsed() {
      this.collapsed = !this.collapsed;
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$border-style: solid;
$border-width: 1px;

// Values specified in rgba due to alpha transparency used in the background
// of the nav area, so they are represented as clear overlays here
$toggle-bg-color: var(--color-nav-hierarchy-collapse-background);
$toggle-bg-color-dark: var(--color-nav-dark-hierarchy-collapse-background);
$toggle-border-color: var(--color-nav-hierarchy-collapse-borders);
$hierarchy-toggle-border-width: 0 !default;
$toggle-height: rem(19px);
$toggle-width: rem(36px);

// Values specified here are opaque versions of the dropdown colors so that
// they match (without using alpha)
$dropdown-bg-color: $toggle-bg-color;
$dropdown-bg-color-dark: $toggle-bg-color-dark;
$dropdown-border-color: var(--color-nav-hierarchy-collapse-borders);
$dropdown-border-color-dark: var(--color-nav-dark-hierarchy-collapse-borders);
$dropdown-transition-duration: 250ms;
$hierarchy-dropdown-border-width: 0px !default;
$hierarchy-dropdown-box-shadow: 0 1px 4px -1px var(--color-figure-gray-secondary) !default;

$tail-width: 1rem;
$tail-offset: rem($nav-menu-item-left-margin)
  + rem($nav-space-hierarchy-elements)
  - ($toggle-width / 2)
  + ($tail-width / 2) + rem(4px);

$dropdown-vertical-offset: rem(7px);

.hierarchy-collapsed-items {
  position: relative;
  display: inline-flex;
  align-items: center;
  margin-left: $nav-space-hierarchy-elements;

  .hierarchy-item-icon {
    width: 9px;
    height: 15px;
    margin-right: $nav-space-hierarchy-elements;
    display: flex;
    justify-content: center;
    font-size: 1em;
    align-self: baseline;
  }

  @include nav-in-breakpoint() {
    display: none;
  }
}

.hierarchy-collapsed-items .toggle {
  background: $toggle-bg-color;
  border-color: $toggle-border-color;
  border-radius: $border-radius;
  border-style: $border-style;
  border-width: $hierarchy-toggle-border-width;
  font-weight: $font-weight-semibold;
  height: $toggle-height;
  text-align: center;
  width: $toggle-width;
  display: flex;
  align-items: center;
  justify-content: center;
  @include nav-dark() {
    background: $toggle-bg-color-dark;
  }

  &:active,
  &:focus,
  &.focused {
    @include focus-shadow();
  }
}

.indicator {
  width: 1em;
  height: 1em;
  display: flex;
  align-items: center;

  .toggle-icon {
    width: 100%;
  }
}

.dropdown {
  background: $dropdown-bg-color;
  border-color: $dropdown-border-color;
  border-radius: $border-radius;
  border-style: $border-style;
  box-shadow: $hierarchy-dropdown-box-shadow;
  border-width: $hierarchy-dropdown-border-width;
  padding: 0 0.5rem;
  position: absolute;
  z-index: 42;
  top: calc(100% + #{$dropdown-vertical-offset});
  @include nav-dark() {
    background: $dropdown-bg-color-dark;
    border-color: $dropdown-border-color-dark;
  }

  &.collapsed {
    opacity: 0;
    transform: translate3d(0, -$dropdown-vertical-offset, 0);
    transition: opacity $dropdown-transition-duration ease,
    transform $dropdown-transition-duration ease,
    visibility 0s linear $dropdown-transition-duration;
    visibility: hidden;
  }

  &:not(.collapsed) {
    opacity: 1;
    transform: none;
    transition: opacity $dropdown-transition-duration ease,
    transform $dropdown-transition-duration ease,
    visibility 0s linear 0s;
    visibility: visible;

    @include nav-in-breakpoint() {
      display: none;
    }
  }

  &::before {
    border-bottom-color: $dropdown-bg-color;
    border-bottom-style: $border-style;
    border-bottom-width: $tail-width / 2;
    border-left-color: transparent;
    border-left-style: $border-style;
    border-left-width: $tail-width / 2;
    border-right-color: transparent;
    border-right-style: $border-style;
    border-right-width: $tail-width / 2;
    content: '';
    left: $tail-offset;
    position: absolute;
    top: rem($border-width) - ($tail-width / 2);

    @include nav-dark() {
      border-bottom-color: $dropdown-bg-color-dark;
    }
  }
}

.dropdown-item {
  border-top-color: $dropdown-border-color;
  border-top-style: $border-style;
  border-top-width: $border-width;

  @include nav-dark() {
    border-top-color: $dropdown-border-color-dark;
  }

  &:first-child {
    border-top: none;
  }
}

.nav-menu-link {
  @include truncate(rem(980px));
  display: block;
  padding: 0.75rem 1rem;
}
</style>
