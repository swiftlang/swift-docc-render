<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <NavBase
    :breakpoint="isWideFormat ? BreakpointName.small: BreakpointName.medium"
    :hasOverlay="false"
    hasSolidBackground
    :hasNoBorder="hasNoBorder"
    :isDark="isDark"
    :isWideFormat="isWideFormat"
    hasFullWidthBorder
    class="documentation-nav"
    aria-label="API Reference"
  >
    <template slot="pre-title" v-if="isWideFormat">
      <button class="sidenav-toggle" @click.prevent="$emit('toggle-sidenav')">
        <SidenavIcon class="icon-inline sidenav-icon" />
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
      <slot name="tray-after" v-bind="{ breadcrumbCount }" />
    </template>
    <template slot="after-content">
      <slot name="after-content" />
    </template>
  </NavBase>
</template>

<script>
import NavBase from 'docc-render/components/NavBase.vue';
import { BreakpointName } from 'docc-render/utils/breakpoints';
import SidenavIcon from 'theme/components/Icons/SidenavIcon.vue';
import Hierarchy from './DocumentationNav/Hierarchy.vue';

export default {
  name: 'DocumentationNav',
  components: {
    SidenavIcon,
    NavBase,
    Hierarchy,
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
}

.documentation-nav {
  /deep/ {
    // normalize the Title font with menu items
    .nav-title {
      @include font-styles(documentation-nav);

      @include breakpoint(small, $scope: nav) {
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

.sidenav-icon {
  width: $sidenav-icon-size;
  height: $sidenav-icon-size;
}

// make sure toggle is not visible, from medium up, in default scope.
// Sidenav is only toggle-able at small, in default scope.
.sidenav-toggle {
  @include breakpoints-from(medium) {
    display: none;
  }
}
</style>
