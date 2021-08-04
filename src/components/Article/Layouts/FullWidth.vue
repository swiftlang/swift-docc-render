<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="full-width">
    <component
      v-for="(group, i) in groups"
      v-bind="propsFor(group)"
      class="group"
      :is="componentFor(group)"
      :key="i"
    >
      <ContentNode :content="group.content" />
    </component>
  </div>
</template>

<script>
import ContentNode from 'docc-render/components/Article/ContentNode.vue';
import LinkableElement from 'docc-render/components/LinkableElement.vue';

const { BlockType } = ContentNode;

export default {
  name: 'FullWidth',
  components: {
    ContentNode,
    LinkableElement,
  },
  props: ContentNode.props,
  computed: {
    // Partition the top level content nodes in the tree to create a group
    // for each heading, which is used to link/track each group in the navbar.
    groups: ({ content }) => content.reduce((groups, node) => (
      (groups.length === 0 || node.type === BlockType.heading) ? ([
        // If the current node is a heading, append a new group to the array
        // with this heading and start its list of nodes. A new item will always
        // be created for the first node also, regardless of whether or not it
        // has a heading.
        ...groups,
        {
          heading: node.type === BlockType.heading ? node : null,
          content: [node],
        },
      ]) : ([
        // If the current node is not a heading, append this to the last group
        // in the array to treat this node as belonging to the last encountered
        // heading.
        ...groups.slice(0, groups.length - 1),
        {
          heading: groups[groups.length - 1].heading,
          content: groups[groups.length - 1].content.concat(node),
        },
      ])
    ), []),
  },
  methods: {
    componentFor(group) {
      return group.heading ? LinkableElement : 'div';
    },
    depthFor(heading) {
      switch (heading.level) {
      case 1:
      case 2:
        return 0;
      default:
        // Treat headings h3 and beyond as an increased level of depth (for
        // indentation display purposes)
        return 1;
      }
    },
    propsFor(group) {
      return group.heading ? ({
        anchor: group.heading.anchor,
        depth: this.depthFor(group.heading),
        title: group.heading.text,
      }) : ({
      });
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.group[id] {
  // Purposefully splitting the spacing between margin and padding here so that
  // the padding can provide spacing when linking to a given section using the
  // navbar.
  margin-top: $article-stacked-margin-small;
  padding-top: $article-stacked-margin-small;
}

// By default, content nodes of type "image" are treated as inline elements, so
// this override styles images in "full-width" layouts to appear as centered
// block elements within the full width container (same for videos)
/deep/ {
  img,
  video {
    display: block;
    margin: 0 auto;
    max-width: 100%;
  }
}
</style>
