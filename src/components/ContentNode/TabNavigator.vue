<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="TabNavigator"
    :class="[{ 'tabs--vertical': vertical }]"
  >
    <Tabnav v-model="current" v-bind="{ position, vertical }">
      <TabnavItem v-for="(item, index) in items" :key="item.title" :value="index">
        {{ item.title }}
      </TabnavItem>
    </Tabnav>
    <div class="tabs-content">
      <ContentNode :content="currentContent" />
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
    ContentNode: () => import('docc-render/components/ContentNode.vue'),
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
    items: {
      type: Array,
      required: true,
      default: () => [],
    },
  },
  data() {
    return {
      current: this.items.length ? 0 : null,
    };
  },
  computed: {
    currentContent: ({ current, items }) => items[current].content,
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

  .tabnav {
    width: 20%;
    white-space: normal;
    @include breakpoint(small) {
      width: 35%;
    }
  }

  .tabs-content {
    flex: 1 0 auto;
  }
}
</style>
