<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="TabNavigator"
    :class="[{ 'tabs--vertical': vertical }]"
  >
    <Tabnav v-model="currentTitle" v-bind="{ position, vertical }">
      <TabnavItem v-for="title in titles" :key="title" :value="title">
        {{ title }}
      </TabnavItem>
    </Tabnav>
    <div class="tabs-content">
      <template v-for="title in titles">
        <slot v-if="title === currentTitle" :name="title" />
      </template>
    </div>
  </div>
</template>

<script>
import Tabnav from 'docc-render/components/Tabnav.vue';
import TabnavItem from 'docc-render/components/TabnavItem.vue';

/**
 * Tab navigation component, that renders `ContentNode`,
 * with ability to align the tabs horizontally and vertically to the start/center/end of the line.
 * It can also flip the navigation, so it renders content first, navigation second,
 * in both horizontal and vertical mode.
 */
export default {
  name: 'TabNavigator',
  components: {
    TabnavItem,
    Tabnav,
  },
  props: {
    vertical: {
      type: Boolean,
      default: false,
    },
    position: {
      type: String,
      default: 'start',
      validator: v => new Set(['start', 'center', 'end']).has(v),
    },
    titles: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      currentTitle: this.titles[0],
    };
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.TabNavigator {
  margin-bottom: $stacked-margin-large;

  .tabnav {
    overflow: auto;
    white-space: nowrap;
  }
}

.tabs--vertical {
  display: flex;
  flex-flow: row-reverse;

  @include breakpoint(small) {
    flex-flow: column-reverse;
  }

  .tabnav {
    width: 20%;
    flex: 0 0 auto;
    white-space: normal;
    margin: 0;
    @include breakpoint(small) {
      width: 100%;
    }
  }

  .tabs-content {
    flex: 1 1 auto;
    min-width: 0;
    padding-right: $stacked-margin-large;
    @include breakpoint(small) {
      padding-right: 0;
      padding-bottom: $stacked-margin-large;
    }
  }
}
</style>
