<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="call-to-action">
    <Row>
      <LeftColumn>
        <span class="label">{{label}}</span>
        <h2> {{ title }} </h2>
        <ContentNode v-if="abstract" class="description" :content="[abstractParagraph]"/>
        <Button v-if="action" :action="action" />
      </LeftColumn>
      <RightColumn class="right-column">
        <Asset v-if="media" class="media" :identifier="media"/>
      </RightColumn>
    </Row>
  </div>
</template>

<script>
import Asset from 'docc-render/components/Asset.vue';
import ContentNode from 'docc-render/components/ContentNode.vue';
import GridRow from 'docc-render/components/GridRow.vue';
import GridColumn from 'docc-render/components/GridColumn.vue';

import CallToActionButton from './CallToActionButton.vue';

export default {
  name: 'CallToAction',
  components: {
    Asset,
    Button: CallToActionButton,
    ContentNode,
    LeftColumn: {
      render(createElement) {
        return createElement(
          GridColumn,
          {
            props: {
              span: {
                large: 5,
                small: 12,
              },
            },
          },
          this.$slots.default,
        );
      },
    },
    RightColumn: {
      render(createElement) {
        return createElement(
          GridColumn,
          {
            props: {
              span: {
                large: 6,
                small: 12,
              },
            },
          },
          this.$slots.default,
        );
      },
    },
    Row: GridRow,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    label: {
      type: String,
      required: true,
    },
    abstract: {
      type: Array,
      required: false,
    },
    action: {
      type: Object,
      required: false,
    },
    media: {
      type: String,
      required: false,
    },
  },
  computed: {
    // Wraps the abstract in a paragraph element, so that we can pass it to `ContentNode`.
    abstractParagraph() {
      return {
        type: 'paragraph',
        inlineContent: this.abstract,
      };
    },
  },
};
</script>

<style scoped lang="scss">
@import "docc-render/styles/_core.scss";

.call-to-action {
  padding: 65px 0;
  background: var(--color-call-to-action-background);
}

.theme-dark .call-to-action {
  --color-call-to-action-background: rgb(66, 66, 66);
}

.row {
  @include breakpoint-content;

  display: flex;
  align-items: center;
}

/deep/ img, /deep/ video {
  max-height: 560px;
}

h2 {
  @include font-styles(heading-2);
}

.label {
  display: block;
  @include font-styles(eyebrow-reduced);
  margin-bottom: $stacked-margin-small;
  color: var(--color-eyebrow);
}

.content {
  margin-bottom: 1.5rem;
}

.right-column {
  margin-left: auto;
}

@include breakpoint(small) {
  .row {
    display: block;
  }

  .col + .col {
    margin-top: 40px;
  }
}
</style>
