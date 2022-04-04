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
    <template #pre-title="{ closeNav, currentBreakpoint }" v-if="isWideFormat">
      <button
        class="sidenav-toggle"
        @click.prevent="handleSidenavToggle(closeNav, currentBreakpoint)"
      >
        <span class="sidenav-icon-wrapper">
          <SidenavIcon class="icon-inline sidenav-icon" />
        </span>
      </button>
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
    <template slot="tray">
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
  },
  computed: {
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
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$sidenav-icon-size: 19px;

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

.sidenav-toggle {
  align-self: center;
  color: var(--color-nav-link-color);
  position: relative;
  margin-right: $nav-pre-title-item-margin;

  @include nav-dark {
    color: var(--color-nav-dark-link-color);
  }

  @include nav-in-breakpoint() {
    padding-right: $nav-pre-title-item-margin;
    padding-left: $nav-pre-title-item-margin;
    margin-left: -$nav-pre-title-item-margin;
  }

  &:hover .sidenav-icon-wrapper {
    background: var(--color-fill-gray-quaternary);

    .theme-dark & {
      background: dark-color(fill-gray-quaternary);
    }
  }

  &:after {
    content: '';
    position: absolute;
    right: -$nav-pre-title-item-margin;
    height: .8em;
    top: 50%;
    width: 1px;
    background: var(--color-nav-color);
    transform: translateY(-50%);
  }

  @include nav-in-breakpoint() {
    $space: 14px;
    margin-left: -$space;
    margin-right: -$space;
    padding-left: $space;
    padding-right: $space;
    align-self: stretch;

    &:after {
      display: none;
    }
  }
}

.sidenav-icon-wrapper {
  padding: 5px;
  margin-left: -5px;
  margin-right: -5px;
  display: flex;
  align-items: center;
  justify-content: center;
  border-radius: $tiny-border-radius;
}

.sidenav-icon {
  width: $sidenav-icon-size;
  height: $sidenav-icon-size;
}
</style>
