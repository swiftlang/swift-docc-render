<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template functional>
  <component
    :is="$options.components.NavMenuItemBase"
    :class="[{ collapsed: props.isCollapsed }, data.staticClass]"
    class="hierarchy-item"
  >
    <span class="hierarchy-item-icon icon-inline">/</span>
    <router-link v-if="props.url" class="parent item nav-menu-link" :to="props.url">
      <slot />
    </router-link>
    <template v-else>
      <span class="current item">
        <slot />
      </span>
      <slot name="tags" />
    </template>
  </component>
</template>

<script>
import NavMenuItemBase from 'docc-render/components/NavMenuItemBase.vue';
import InlineChevronRightIcon from 'theme/components/Icons/InlineChevronRightIcon.vue';

export default {
  name: 'HierarchyItem',
  components: { NavMenuItemBase, InlineChevronRightIcon },
  props: {
    isCollapsed: Boolean,
    url: {
      type: String,
      required: false,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.hierarchy-item {
  // style the chevron icon
  /deep/ .hierarchy-item-icon {
    width: 9px;
    height: 15px;
    margin-right: $nav-space-hierarchy-elements;
    display: flex;
    justify-content: center;
    font-size: 1em;
    align-self: baseline;
    // hide on when collapsed
    @include nav-in-breakpoint() {
      display: none;
    }
  }

  display: flex;
  align-items: center;
  margin-left: $nav-space-hierarchy-elements;

  @include nav-in-breakpoint() {
    border-top: 1px solid var(--color-nav-hierarchy-item-borders);
    display: flex;
    align-items: center;

    @include nav-dark($nested: true) {
      border-top-color: var(--color-nav-dark-hierarchy-item-borders);
    }

    &:first-of-type {
      border-top: none;
    }
  }

  &.collapsed {
    display: none;

    @include nav-in-breakpoint() {
      display: inline-block;
    }
  }
}

.item {
  display: inline-block;
  vertical-align: middle;

  @include nav-in-breakpoint() {
    @include truncate(100%);
    height: 100%;
    line-height: rem(42px);
  }
}

$-max-uncollapsed-breadcrumbs: 5;
$-max-breadcrumb-width: 9rem;
$-max-breadcrumb-width-with-badge: 7.2rem;

@include breakpoints-from(medium, nav) {
  @for $i from 1 through $-max-uncollapsed-breadcrumbs {
    $-multiplier: $-max-uncollapsed-breadcrumbs + 1 - $i;

    // Without any badges, the max-width is set as follows:
    // * 1 breadcrumb = 27rem
    // * 2 breadcrumbs = 18rem each
    // * 3 breadcrumbs = 9rem each
    .hierarchy-item {
      &:first-child:nth-last-child(#{$i}),
      &:first-child:nth-last-child(#{$i}) ~ .hierarchy-item {
        .item {
          @include truncate($-max-breadcrumb-width * $-multiplier);
        }
      }
    }

    // With a badge, the max-width is set as follows:
    // * 1 breadcrumb = 21.6rem
    // * 2 breadcrumbs = 14.4rem each
    // * 3 breadcrumbs = 7.2rem each
    .has-badge .hierarchy-item {
      &:first-child:nth-last-child(#{$i}),
      &:first-child:nth-last-child(#{$i}) ~ .hierarchy-item {
        .item {
          @include truncate($-max-breadcrumb-width-with-badge * $-multiplier);
        }
      }
    }
  }

  // With more than 3 breadcrumbs, the first item is a fixed-size button, so
  // the adjacent visible breadcrumbs can take up a little extra room.
  $-multiplier-truncated: 1.2;

  // With more than 3 breadcrumbs (and no badges), the max-width is set
  // to 10.8rem
  .hierarchy-collapsed-items ~ .hierarchy-item {
    .item {
      @include truncate($-max-breadcrumb-width * $-multiplier-truncated);
    }

    &:last-child {
      .item {
        max-width: none;
      }
    }
  }

  // With more than 3 breadcrumbs and a badge, the max-width is set to
  // 8.64rem
  .has-badge .hierarchy-collapsed-items ~ .hierarchy-item {
    .item {
      @include truncate($-max-breadcrumb-width-with-badge * $-multiplier-truncated);
    }
  }
}
</style>
