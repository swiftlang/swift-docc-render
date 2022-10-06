<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <BaseNavigatorCardItem
    :style="`--index: ${index};`"
    :hideNavigatorIcon="hideNavigatorIcon"
    class="loading-navigator-item"
  >
    <template #navigator-icon="{ className }">
      <div :class="className"/>
    </template>
    <template #title-container>
      <div
        class="loader"
        :style="{ width }"
      />
    </template>
  </BaseNavigatorCardItem>
</template>

<script>
import BaseNavigatorCardItem from 'docc-render/components/Navigator/BaseNavigatorCardItem.vue';

export default {
  name: 'LoadingNavigatorItem',
  components: {
    BaseNavigatorCardItem,
  },
  props: {
    ...BaseNavigatorCardItem.props,
    index: {
      type: Number,
      default: 0,
    },
    width: {
      type: String,
      default: '50%',
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.loader {
  height: rem(12px);
  background-color: var(--color-fill-gray-tertiary);
  border-radius: 4px;
}

.navigator-icon {
  width: $icon-size-default;
  height: $icon-size-default;
  border-radius: 2px;
  background-color: var(--color-fill-gray-tertiary);
}

.loading-navigator-item {
  animation: pulse 2.5s ease;
  animation-iteration-count: infinite;
  animation-fill-mode: forwards;
  opacity: 0;
  animation-delay: calc(var(--visibility-delay) + 0.3s * var(--index));
}
</style>
