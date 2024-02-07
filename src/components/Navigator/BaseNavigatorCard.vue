<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022-2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="navigator-card">
    <div class="navigator-card-full-height">
      <div class="navigator-card-inner">
        <div class="head-wrapper">
          <slot name="above-navigator-head"/>
          <div class="head-inner">
            <slot name="navigator-head"/>
            <button
              :id="SIDEBAR_HIDE_BUTTON_ID"
              class="close-card"
              :aria-label="$t('navigator.close-navigator')"
              @click="handleHideClick"
            >
              <InlineCloseIcon class="icon-inline close-icon" />
            </button>
          </div>
        </div>
        <slot name="body" className="card-body"/>
      </div>
    </div>
  </div>
</template>

<script>
import {
  SIDEBAR_HIDE_BUTTON_ID,
} from 'docc-render/constants/sidebar';
import InlineCloseIcon from 'theme/components/Icons/InlineCloseIcon.vue';
import { baseNavOpenSidenavButtonId } from 'docc-render/constants/nav';

export default {
  name: 'BaseNavigatorCard',
  components: {
    InlineCloseIcon,
  },
  data() {
    return {
      SIDEBAR_HIDE_BUTTON_ID,
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

$navigator-card-vertical-spacing: 10px !default;
$close-icon-size: 19px;
$close-icon-padding: 5px;

.navigator-card {
  --card-vertical-spacing: #{$navigator-card-vertical-spacing};
  --card-horizontal-spacing: #{$nav-card-horizontal-spacing-large};
  --nav-filter-horizontal-padding: 20px;
  --visibility-delay: 1s; // don't show spinner until this much time has passed
  display: flex;
  flex-direction: column;
  min-height: 0;
  height: calc(var(--app-height) - $nav-height);
  position: sticky;
  top: $nav-height;

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
    display: none;
    width: 100%;
    @include font-styles(nav-title-large);
    height: $nav-height-small;

    // display only in medium and small viewports
    @include breakpoint(medium, nav) {
      display: flex;
      justify-content: flex-end;
      align-items: center;
    }

    > a, span {
      color: var(--color-figure-gray);
      width: 100%;
    }
  }

  .head-wrapper {
    @include safe-area-left-set(margin-left, var(--card-horizontal-spacing));
    @include safe-area-right-set(margin-right, var(--card-horizontal-spacing));
    display: flex;
    justify-content: space-between;
    flex: 1 0 auto;
  }
}

.close-card {

  .close-icon {
    width: $close-icon-size;
    height: $close-icon-size;
  }
}

:deep() {
  .card-body {
    display: flex;
    flex-direction: column;
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
  padding-top: $navigator-card-vertical-spacing;

  @include breakpoint(medium, nav) {
    padding-top: 0;
  }

  .filter-on-top & {
    padding-top: 0;
  }
}
</style>
