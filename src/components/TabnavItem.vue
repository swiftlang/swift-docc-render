<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <li class="tabnav-item">
    <a
      href="#"
      class="tabnav-link"
      :class="{ 'active': isActive }"
      @click.prevent="tabnavData.selectTab(value)"
    >
      <slot />
    </a>
  </li>
</template>

<script>
export default {
  name: 'TabnavItem',
  inject: {
    tabnavData: {
      default: { activeTab: null, selectTab: () => {} },
    },
  },
  props: {
    value: {
      type: String,
      default: '',
    },
  },
  computed: {
    isActive({ tabnavData, value }) {
      return tabnavData.activeTab === value;
    },
  },
};
</script>

<style lang='scss' scoped>
@import 'docc-render/styles/_core.scss';

$tabnav-padding: 11px !default;
$tabnav-bottom-border-margin: 4px !default;
$tabnav-item-gutter: rem(30px);

.tabnav-item {
  border-bottom: 1px solid;
  border-color: var(--colors-tabnav-item-border-color, var(--color-tabnav-item-border-color));

  display: inline-block;
  list-style: none;
  padding-left: $tabnav-item-gutter;
  margin: 0;
  outline: none;

  &:first-child {
    padding-left: 0;
  }

  // hack to make sure item margin is not overwritten by external css
  &:nth-child(n+1) {
    margin: 0;
  }
}

.tabnav-link {
  $-tabnav-padding-focus-offset: 2px;
  $-tabnav-padding-top: $tabnav-padding - $-tabnav-padding-focus-offset;

  color: var(--colors-secondary-label, var(--color-secondary-label));
  @include font-styles(tabnav-link);
  padding: $-tabnav-padding-top 0 $tabnav-padding;
  margin-top: $-tabnav-padding-focus-offset;
  margin-bottom: $tabnav-bottom-border-margin;
  text-align: left;
  text-decoration: none;
  display: block;
  position: relative;
  z-index: 0;

  &:hover {
    text-decoration: none;
  }

  &:focus {
    outline-offset: -1px;
  }

  &:after {
    content: '';
    position: absolute;
    bottom: -1 * ($tabnav-bottom-border-margin + 1);
    left: 0;
    width: 100%;
    border: 1px solid transparent;
  }

  &.active {
    color: var(--colors-text, var(--color-text));
    cursor: default;
    z-index: 10;

    &:after {
      border-bottom-color: var(--colors-text, var(--color-text));
    }
  }
}
</style>
