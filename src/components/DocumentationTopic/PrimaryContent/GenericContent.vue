<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ContentNode v-bind="$props" />
</template>

<script>
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';

export default {
  name: 'GenericContent',
  inject: {
    store: {
      default() {
        return {
          addOnThisPageSection() {},
        };
      },
    },
  },
  components: { ContentNode },
  props: ContentNode.props,
  methods: {
    ...ContentNode.methods,
    addOnThisPageSections() {
      const { isTopLevelHeading, store } = this;
      this.forEach((node) => {
        if (isTopLevelHeading(node)) {
          store.addOnThisPageSection({
            anchor: node.anchor,
            title: node.text,
          });
        }
      });
    },
    isTopLevelHeading(node) {
      const { level, type } = node;
      return type === ContentNode.BlockType.heading && level === 2;
    },
  },
  created() {
    this.addOnThisPageSections();
  },
};
</script>
