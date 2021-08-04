<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="tutorials-navigation-menu" :class="{ collapsed }">
    <button
      class="toggle"
      :aria-expanded="collapsed ? 'false': 'true'"
      type="button"
      @click.stop="onClick"
    >
      <span class="text">{{ title }}</span>
      <InlineCloseIcon class="toggle-icon icon-inline" />
    </button>
    <transition-expand>
      <div class="tutorials-navigation-menu-content" v-if="!collapsed">
        <TutorialsNavigationList aria-label="Chapters">
          <slot />
        </TutorialsNavigationList>
      </div>
    </transition-expand>
  </div>
</template>

<script>
import InlineCloseIcon from 'theme/components/Icons/InlineCloseIcon.vue';
import TransitionExpand from 'docc-render/components/TransitionExpand.vue';
import TutorialsNavigationList from './TutorialsNavigationList.vue';

export default {
  name: 'TutorialsNavigationMenu',
  components: { InlineCloseIcon, TransitionExpand, TutorialsNavigationList },
  props: {
    collapsed: {
      type: Boolean,
      default: true,
    },
    title: {
      type: String,
      required: true,
    },
  },
  methods: {
    onClick() {
      if (this.collapsed) {
        this.$emit('select-menu', this.title);
      } else {
        this.$emit('deselect-menu');
      }
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';
// animation
$tutorials-overview-navigation-curve: ease-in !default;
$duration: 0.2s;
$inactiveColor: dark-color(figure-gray-secondary-alt);
$activeColor: light-color(fill-tertiary);
$hoverColor: dark-color(figure-gray-secondary-alt);
$line-height: 21px;

.toggle {
  // copied directly
  color: $activeColor;
  line-height: $line-height;

  display: flex;
  align-items: center;
  width: 100%;
  font-weight: $font-weight-semibold;
  padding: 6px 6px 6px 0;
  border-bottom: 1px solid dark-color(fill-tertiary);
  text-decoration: none;
  box-sizing: border-box;

  @include breakpoint(small, $scope: nav) {
    padding-right: 6px;
    border-bottom-color: rgba(255, 255, 255, 0.10);
  }

  .text {
    word-break: break-word;
  }

  &:hover {
    text-decoration: none;
  }

  .toggle-icon {
    display: inline-block;
    transition: transform $duration $tutorials-overview-navigation-curve;
    height: 0.4em;
    width: 0.4em;
    margin-left: auto;
    margin-right: .2em;

    .collapsed & {
      transform: rotate(45deg);
    }
  }

  .collapsed & {
    color: $inactiveColor;

    &:hover {
      color: $hoverColor;
    }
  }
}

.tutorials-navigation-menu-content {
  opacity: 1;
  transition: height $duration $tutorials-overview-navigation-curve,
  opacity $duration $tutorials-overview-navigation-curve;

  .collapsed & {
    // animation
    height: 0;
    opacity: 0;
  }

  .tutorials-navigation-list {
    padding: 24px 0 12px 0;
  }
}
</style>
