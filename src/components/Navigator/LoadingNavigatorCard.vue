<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <BaseNavigatorCard
    v-bind="$props"
    @close="$emit('close')"
  >
    <template #body="{ className }">
      <transition name="delay-visibility">
        <div aria-hidden="true" class="loading-navigator" :class="className">
          <LoadingNavigatorItem
            v-for="(row, index) in LOADER_ROWS"
            :key="index"
            :index="index"
            :width="row.width"
            :hideNavigatorIcon="row.hideNavigatorIcon"
          />
        </div>
      </transition>
    </template>
  </BaseNavigatorCard>
</template>

<script>
import BaseNavigatorCard from 'docc-render/components/Navigator/BaseNavigatorCard.vue';
import LoadingNavigatorItem from 'docc-render/components/Navigator/LoadingNavigatorItem.vue';

const LOADER_ROWS = [
  { width: '30%', hideNavigatorIcon: true },
  { width: '80%' },
  { width: '50%' },
];

export default {
  name: 'LoadingNavigatorCard',
  components: {
    BaseNavigatorCard,
    LoadingNavigatorItem,
  },
  props: {
    ...BaseNavigatorCard.props,
  },
  data() {
    return {
      LOADER_ROWS,
    };
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.delay-visibility-enter-active {
  transition: visibility var(--visibility-delay);
  visibility: hidden;
}

.loading-navigator {
  padding-top: var(--card-vertical-spacing);
}
</style>
