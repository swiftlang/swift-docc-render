<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <NavBase
    :breakpoint="BreakpointName.medium"
    :hasOverlay="false"
    hasSolidBackground
    :hasNoBorder="hasNoBorder"
    :isDark="isDark"
    :isWideFormat="isWideFormat"
    hasFullWidthBorder
    class="documentation-nav"
    aria-label="API Reference"
  >
    <template #pre-title="{ closeNav, isOpen, currentBreakpoint }" v-if="isWideFormat">
      <transition name="sidenav-toggle">
        <div
          v-show="sidenavHiddenOnLarge"
          class="sidenav-toggle-wrapper"
        >
          <button
            aria-label="Open documentation navigator"
            :id="baseNavOpenSidenavButtonId"
            class="sidenav-toggle"
            :tabindex="isOpen ? -1 : null"
            @click.prevent="handleSidenavToggle(closeNav, currentBreakpoint)"
          >
          <span class="sidenav-icon-wrapper">
            <SidenavIcon class="icon-inline sidenav-icon" />
          </span>
          </button>
          <span class="sidenav-toggle__separator" />
        </div>
      </transition>
    </template>
    <template slot="default">
      <slot
        name="title"
        v-bind="{ rootLink, linkClass: 'nav-title-link', inactiveClass: 'inactive' }"
      >
        <router-link
          v-if="rootLink"
          :to="rootLink"
          class="nav-title-link"
        >
          Documentation
        </router-link>
        <span v-else class="nav-title-link inactive">Documentation</span>
      </slot>
    </template>
    <template #tray="{ closeNav }">
      <Hierarchy
        :currentTopicTitle="title"
        :isSymbolDeprecated="isSymbolDeprecated"
        :isSymbolBeta="isSymbolBeta"
        :parentTopicIdentifiers="hierarchyItems"
        :currentTopicTags="currentTopicTags"
        :references="references"
      />
      <NavMenuItems
        class="nav-menu-settings"
        :previousSiblingChildren="breadcrumbCount"
      >
        <LanguageToggle
          v-if="interfaceLanguage && (swiftPath || objcPath)"
          :interfaceLanguage="interfaceLanguage"
          :objcPath="objcPath"
          :swiftPath="swiftPath"
          :closeNav="closeNav"
        />
        <slot name="menu-items" />
      </NavMenuItems>
      <slot name="tray-after" v-bind="{ breadcrumbCount }" />
    </template>
    <template slot="after-content">
      <slot name="after-content" />
    </template>
  </NavBase>
</template>

<script>
import NavBase from 'docc-render/components/NavBase.vue';
import NavMenuItems from 'docc-render/components/NavMenuItems.vue';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import SidenavIcon from 'theme/components/Icons/SidenavIcon.vue';
import { SIDEBAR_HIDE_BUTTON_ID } from 'docc-render/constants/sidebar';
import { baseNavOpenSidenavButtonId } from 'docc-render/constants/nav';
import Hierarchy from './DocumentationNav/Hierarchy.vue';
import LanguageToggle from './DocumentationNav/LanguageToggle.vue';

export default {
  name: 'DocumentationNav',
  components: {
    SidenavIcon,
    NavBase,
    NavMenuItems,
    Hierarchy,
    LanguageToggle,
  },
  props: {
    title: {
      type: String,
      required: false,
    },
    parentTopicIdentifiers: {
      type: Array,
      required: false,
    },
    isSymbolBeta: {
      type: Boolean,
      required: false,
    },
    isSymbolDeprecated: {
      type: Boolean,
      required: false,
    },
    isDark: {
      type: Boolean,
      default: false,
    },
    hasNoBorder: {
      type: Boolean,
      default: false,
    },
    currentTopicTags: {
      type: Array,
      required: true,
    },
    references: {
      type: Object,
      default: () => ({}),
    },
    isWideFormat: {
      type: Boolean,
      default: true,
    },
    interfaceLanguage: {
      type: String,
      required: false,
    },
    objcPath: {
      type: String,
      required: false,
    },
    swiftPath: {
      type: String,
      required: false,
    },
    sidenavHiddenOnLarge: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    baseNavOpenSidenavButtonId: () => baseNavOpenSidenavButtonId,
    BreakpointName: () => BreakpointName,
    breadcrumbCount: ({ hierarchyItems }) => hierarchyItems.length + 1,
    /**
     * Returns the first(root) hierarchy item reference
     * @return {Object}
     */
    rootHierarchyReference: ({ parentTopicIdentifiers, references }) => (
      references[parentTopicIdentifiers[0]] || {}
    ),
    /**
     * Returns whether the root link is a technology page.
     * @return {boolean}
     */
    isRootTechnologyLink: ({ rootHierarchyReference: { kind } }) => kind === 'technologies',
    /**
     * Returns the root url reference object, if is a `technologies` link.
     * Otherwise returns a manual route query object.
     * @return {Object}
     */
    rootLink: ({
      isRootTechnologyLink, rootHierarchyReference, $route,
    }) => (isRootTechnologyLink
      ? {
        path: rootHierarchyReference.url,
        query: $route.query,
      } : null),
    /**
     * Strips out the first link, if is the root Technologies link.
     * @return {string[]}
     */
    hierarchyItems: ({ parentTopicIdentifiers, isRootTechnologyLink }) => (
      isRootTechnologyLink ? parentTopicIdentifiers.slice(1) : parentTopicIdentifiers
    ),
  },
  methods: {
    async handleSidenavToggle(closeNav, currentBreakpoint) {
      // close the navigation
      await closeNav();
      // toggle the sidenav
      this.$emit('toggle-sidenav', currentBreakpoint);
      await this.$nextTick();
      const trigger = document.getElementById(SIDEBAR_HIDE_BUTTON_ID);
      if (trigger) {
        trigger.focus();
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$sidenav-icon-size: 19px;
$sidenav-icon-padding-size: 5px;

// overwrite the typography of menu items outside of breakpoint only
/deep/ .nav-menu {
  @include font-styles(documentation-nav);
  // vertically align the items
  padding-top: 0;

  &-settings {
    @include font-styles(nav-toggles);

    @include breakpoint-only-largenav() {
      margin-left: $nav-space-between-elements;
    }

    @include nav-in-breakpoint {
      // do not apply border if no item are above setting links
      &:not([data-previous-menu-children-count="0"]) {
        .nav-menu-setting:first-child {
          border-top: 1px solid dark-color(figure-gray-tertiary);
          display: flex;
          align-items: center;
        }
      }
    }

    .nav-menu-setting {
      display: flex;
      align-items: center;
      color: var(--color-nav-current-link);
      margin-left: 0;

      &:first-child:not(:only-child) {
        margin-right: $nav-space-between-elements;

        @include nav-in-breakpoint() {
          margin-right: 0;
        }
      }

      @include nav-dark() {
        color: var(--color-nav-dark-current-link);
      }

      @include nav-in-breakpoint() {
        &:not(:first-child) {
          border-top: 1px solid dark-color(fill-gray-tertiary);
        }
      }
    }
  }
}

.documentation-nav {
  /deep/ {
    // normalize the Title font with menu items
    .nav-title {
      @include font-styles(documentation-nav);

      @include breakpoint(medium, $scope: nav) {
        padding-top: 0;
      }

      .nav-title-link.inactive {
        height: auto;
        color: var(--color-figure-gray-secondary-alt);
        @include nav-dark($nested: true) {
          color: dark-color(figure-gray-secondary-alt);
        }
      }
    }
  }
}

.sidenav-toggle-wrapper {
  display: flex;
  margin-top: 1px;

  // This is a hack to enforce the toggle to be visible when in breakpoint,
  // even if already toggled off on desktop. Conditionally checking the current breakpoint,
  // would trigger animations when switching between breakpoints.
  @include nav-in-breakpoint() {
    display: flex !important;
  }
}

// desktop only animation for the toggle
@include breakpoints-from(large, nav) {
  .sidenav-toggle-enter-active, .sidenav-toggle-leave-active {
    transition: margin $adjustable-sidebar-hide-transition-duration ease-in 0s;
  }
  .sidenav-toggle-enter, .sidenav-toggle-leave-to {
    // 2x the nav padding, 1px border, and the size of the icon
    margin-left: (rem($sidenav-icon-size + 1px) + $nav-padding * 2) * -1;
  }
}

.sidenav-toggle {
  align-self: center;
  color: var(--color-nav-link-color);
  position: relative;
  margin: 0 -$sidenav-icon-padding-size;

  @include nav-dark {
    color: var(--color-nav-dark-link-color);
  }

  &:hover .sidenav-icon-wrapper {
    background: var(--color-fill-gray-quaternary);

    .theme-dark & {
      background: dark-color(fill-gray-quaternary);
    }
  }

  &__separator {
    height: .8em;
    width: 1px;
    background: var(--color-nav-color);
    align-self: center;
    margin: 0 $nav-padding;
  }

  @include nav-in-breakpoint() {
    $space: 14px;
    margin-left: -$space;
    margin-right: -$space;
    padding-left: $space;
    padding-right: $space;
    align-self: stretch;

    &__separator {
      display: none;
    }
  }
}

.sidenav-icon-wrapper {
  padding: $sidenav-icon-padding-size;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $nano-border-radius;
}

.sidenav-icon {
  display: flex;
  width: $sidenav-icon-size;
  height: $sidenav-icon-size;
}
</style>
