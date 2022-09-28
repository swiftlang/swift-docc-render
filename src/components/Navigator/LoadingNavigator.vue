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
    class="loading-card"
    disabled
  >
    <template #navigator-icon="{ className }">
      <div
        v-if="Math.random() < 0.6"
        :class="className"
      />
    </template>
    <template #title-container>
      <div
        class="loader"
        :style="`width: ${getRandomNumber(200, 50)}px;`"
      />
    </template>
  </BaseNavigatorCardItem>
</template>

<script>
import BaseNavigatorCardItem from 'docc-render/components/Navigator/BaseNavigatorCardItem.vue';

export default {
  name: 'LoadingCard',
  components: {
    BaseNavigatorCardItem,
  },
  props: {
    index: {
      type: Number,
      default: 0,
    },
  },
  methods: {
    getRandomNumber(randomMultiplier, varyBy) {
      return Math.floor(Math.random() * randomMultiplier) + varyBy;
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.loader {
  height: rem(12px);
  background-color: var(--color-fill-gray-tertiary);
  border-radius: rem(4px);

  + .loader {
    margin-top: rem(10px);
  }
}

.navigator-icon {
  margin-right: 7px;
  width: 17px;
  height: 17px;
  border-radius: 2px;
  background-color: var(--color-fill-gray-tertiary);
}

.loading-card {
  height: 35px;
  animation: pulse 2s ease;
  animation-iteration-count: infinite;
  animation-fill-mode: forwards;
  opacity: 0;
  animation-delay: calc(0.25s * var(--index));
}

@keyframes pulse {
  0% {
    opacity: 0;
  }

  50% {
    opacity: 1;
  }

  100% {
    opacity: 0;
  }
}
</style>
