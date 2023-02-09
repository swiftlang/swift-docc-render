<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="navigator-card">
    <div class="navigator-card-full-height">
      <div class="navigator-card-inner">
        <div class="head-wrapper">
          <div class="head-inner">
            <button
              :id="SIDEBAR_HIDE_BUTTON_ID"
              class="close-card"
              :class="{ 'hide-on-large': !allowHiding }"
              aria-label="Close documentation navigator"
              @click="handleHideClick"
            >
              <SidenavIcon class="icon-inline close-icon" />
            </button>
            <Reference
              :id="INDEX_ROOT_KEY"
              :url="technologyPath"
              class="navigator-head"
              @click.alt.native.prevent="$emit('head-click-alt')"
            >
              <h2 class="card-link">
                {{ technology }}
              </h2>
              <Badge v-if="isTechnologyBeta" variant="beta" />
            </Reference>
          </div>
        </div>
        <slot name="body" className="card-body"/>
      </div>
    </div>
  </div>
</template>

<script>
import {
  INDEX_ROOT_KEY,
  SIDEBAR_HIDE_BUTTON_ID,
} from 'docc-render/constants/sidebar';
import SidenavIcon from 'theme/components/Icons/SidenavIcon.vue';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import Badge from 'docc-render/components/Badge.vue';
import { baseNavOpenSidenavButtonId } from 'docc-render/constants/nav';

export default {
  name: 'BaseNavigatorCard',
  components: {
    SidenavIcon,
    Reference,
    Badge,
  },
  props: {
    allowHiding: {
      type: Boolean,
      default: true,
    },
    technologyPath: {
      type: String,
      default: '',
    },
    technology: {
      type: String,
      required: true,
    },
    isTechnologyBeta: {
      type: Boolean,
      default: false,
    },
  },
  data() {
    return {
      SIDEBAR_HIDE_BUTTON_ID,
      INDEX_ROOT_KEY,
    };
  },
  methods: {
    async handleHideClick() {
      this.$emit('close');
      await this.$nextTick();
      const trigger = document.getElementById(baseNavOpenSidenavButtonId);
      if (trigger) {
        trigger.focus();
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

$navigator-card-vertical-spacing: 8px !default;
$navigator-head-background: var(--color-fill) !default;
$navigator-head-background-active: var(--color-fill) !default;
$close-icon-size: 19px;
$close-icon-padding: 5px;

.navigator-card {
  --card-vertical-spacing: #{$navigator-card-vertical-spacing};
  --card-horizontal-spacing: #{$nav-card-horizontal-spacing-large};
  --nav-filter-horizontal-padding: 30px;
  --visibility-delay: 1s; // don't show spinner until this much time has passed
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: calc(var(--app-height) - var(--nav-height, 0px));
  position: sticky;
  top: var(--nav-height, 0px);

  @include breakpoint(medium, nav) {
    height: 100%;
    position: static;
    background: var(--color-fill);
  }

  .navigator-card-full-height {
    min-height: 0;
    flex: 1 1 auto;
  }

  .head-inner {
    overflow: hidden;
  }

  .head-wrapper {
    position: relative;
    flex: 1 0 auto;
  }

  .navigator-head {
    --navigator-head-padding-right: calc(var(--card-horizontal-spacing) * 2 + #{$close-icon-size});
    padding: 0 var(--navigator-head-padding-right) 0 var(--card-horizontal-spacing);
    background: $navigator-head-background;
    border-bottom: 1px solid var(--color-grid);
    display: flex;
    align-items: center;
    height: $nav-height;
    white-space: nowrap;

    .card-link {
      color: var(--color-text);
      @include font-styles(body-reduced);
      font-weight: $font-weight-semibold;
      overflow: hidden;
      text-overflow: ellipsis;
    }

    .badge {
      margin-top: 0;
    }

    &.router-link-exact-active {
      background: $navigator-head-background-active;

      .card-link {
        font-weight: $font-weight-bold;
      }
    }

    &:hover {
      background: var(--color-navigator-item-hover);
      text-decoration: none;
    }

    @include safe-area-left-set(padding-left, var(--card-horizontal-spacing));
    @include safe-area-right-set(padding-right, var(--navigator-head-padding-right));

    @include breakpoint(medium, nav) {
      justify-content: center;
      --navigator-head-padding-right: var(--card-horizontal-spacing);
    }

    @include breakpoint(small, nav) {
      height: $nav-height-small;
      padding: 0 $nav-card-horizontal-spacing-large;
    }
  }
}

.close-card {
  display: flex;
  position: absolute;
  z-index: 1;
  align-items: center;
  justify-content: center;
  right: $nav-padding - rem($close-icon-padding);
  padding: $close-icon-padding;
  margin-left: -$close-icon-padding;
  top: calc(50% - #{$close-icon-size} + #{$close-icon-padding});
  transition: transform $adjustable-sidebar-hide-transition-duration ease-in 0s, visibility 0s;

  @include breakpoint(medium, nav) {
    right: unset;
    top: 0;
    left: 0;
    margin: 0;
    padding: 0 $nav-padding 0 $nav-card-horizontal-spacing-large;
    height: 100%;
    @include safe-area-left-set(padding-left, $nav-padding);
  }

  @include breakpoint(small, nav) {
    padding-left: $nav-padding-small;
    padding-right: $nav-padding-small;
    @include safe-area-left-set(padding-left, $nav-padding-small);
  }

  .close-icon {
    width: $close-icon-size;
    height: $close-icon-size;
  }

  @include breakpoints-from(large, nav) {
    &.hide-on-large {
      display: none;
    }

    &:hover {
      border-radius: $nano-border-radius;
      background: var(--color-fill-gray-quaternary);
    }
    // when the navigator is closed on desktop,
    // move the button so it looks like its going to the nav
    .sidebar-hidden & {
      transition: transform $adjustable-sidebar-hide-transition-duration ease-in 0s,
      visibility 0s linear $adjustable-sidebar-hide-transition-duration;
      visibility: hidden;
      // 2x the nav padding, 1px border, and the size of the icon
      transform: translateX(rem($close-icon-size + 1px) + $nav-padding * 2);
    }
  }
}

/deep/ {
  .card-body {
    // right padding is added by the items, so visually the scroller is stuck to the side
    padding-right: 0;
    flex: 1 1 auto;
    min-height: 0;
    height: 100%;
    @include breakpoint(medium, nav) {
      --card-vertical-spacing: 0px;
    }
  }
}

.navigator-card-inner {
  display: flex;
  flex-flow: column;
  height: 100%;
}
</style>
