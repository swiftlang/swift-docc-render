<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Row class="contenttable-section">
    <Column class="section-title" :span="span.title">
      <slot name="title">
        <h3 class="title">{{ title }}</h3>
      </slot>
    </Column>
    <Column class="section-content" :span="span.content">
      <slot name="abstract" />
      <slot name="discussion" />
      <slot />
    </Column>
  </Row>
</template>

<script>
import GridColumn from 'docc-render/components/GridColumn.vue';
import GridRow from 'docc-render/components/GridRow.vue';

export default {
  name: 'ContentTableSection',
  components: {
    Column: GridColumn,
    Row: GridRow,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
  },
  computed: {
    span() {
      return {
        title: {
          large: 3,
          medium: 3,
          small: 12,
        },
        content: {
          large: 9,
          medium: 9,
          small: 12,
        },
      };
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

@mixin section-border($position) {
  border-#{$position}-color: var(--color-grid);
  border-#{$position}-style: solid;
  border-#{$position}-width: 1px;
}

.contenttable-section {
  @include section-border(top);
  align-items: baseline;
  display: flex;
  margin: $contenttable-spacing-single-side 0;
  padding-top: $contenttable-spacing-single-side;

  &:last-child {
    margin-bottom: 0;
  }
}

.section {
  &-content {
    padding-left: rem(17px)
  }
}

/deep/ .title {
  @include font-styles(label);
}

@include breakpoint(small) {
  .contenttable-section {
    align-items: unset;
    border-top: none;
    display: inherit;
    margin: 0;
  }

  .section {
    &-title,
    &-content {
      padding: 0;
    }
  }

  /deep/ .title {
    @include section-border(bottom);
    margin: 0 0 $contenttable-spacing-single-side 0;
    padding-bottom: 0.5rem;
  }
}
</style>
