<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="parameters-table">
    <Row
      v-for="parameter in parameters"
      :key="parameter[keyBy]"
      :class="changedClasses(parameter[keyBy])"
      class="param"
    >
      <Column class="param-symbol" :span="{ large: 3, small: 12 }">
        <slot name="symbol" v-bind="getProps(parameter, changes[parameter[keyBy]])" />
      </Column>
      <Column class="param-content" :span="{ large: 9, small: 12 }">
        <slot name="description" v-bind="getProps(parameter, changes[parameter[keyBy]])" />
      </Column>
    </Row>
  </div>
</template>

<script>
import GridRow from 'docc-render/components/GridRow.vue';
import GridColumn from 'docc-render/components/GridColumn.vue';

export default {
  name: 'ParametersTable',
  components: {
    Row: GridRow,
    Column: GridColumn,
  },
  props: {
    parameters: {
      type: Array,
      required: true,
    },
    changes: {
      type: Object,
      default: () => ({}),
    },
    keyBy: {
      type: String,
      default: 'name',
    },
  },
  methods: {
    /**
     * Merges the `changes` into the passed parameter.
     * It will overwrite any `changes` named property,
     * but that is highly unlikely
     * @param {object} params
     * @param {object} changes
     * @returns {object}
     */
    getProps(params, changes = {}) {
      return { ...params, changes };
    },
    /**
     * Generate the `changes` classes
     * @param {string} key - the currently looped item key
     * @returns {object}
     */
    changedClasses(key) {
      const { changes } = this;
      const { change } = (changes[key] || {});
      return { [`changed changed-${change}`]: change };
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$param-spacing: rem(28px);

.parameters-table {
  /deep/ {
    .change-added,
    .change-removed {
      display: inline-block;
      max-width: 100%;
    }

    .change-removed,
    .token-removed {
      text-decoration: line-through;
    }
  }
}

.param {
  font-size: rem(15px);
  box-sizing: border-box;

  &.changed {
    display: flex;
    flex-flow: row wrap;
    width: 100%;
    @include change-highlight-target();

    & + & {
      margin-top: $param-spacing/2;
    }
  }
}

.changed {
  .param-content, .param-symbol {
    $change-vertical-padding: $change-coin-y-offset
    - $change-highlight-vertical-space
    - $change-border-stroke-width;
    padding-top: $change-vertical-padding;
    padding-bottom: $change-vertical-padding;
  }

  @include breakpoint(small) {
    .param-content {
      padding-top: 0;
    }
    .param-symbol {
      padding-bottom: 0;
    }
  }
}

.param-symbol {
  text-align: right;

  @include breakpoint(small) {
    text-align: left;
  }

  /deep/ .type-identifier-link {
    color: var(--color-link);
  }
}

.param + .param {
  margin-top: $param-spacing;

  &:first-child {
    margin-top: 0;
  }
}

.param-content {
  padding-left: 1rem;
  @include change-highlight-end-spacing();

  @include breakpoint(small) {
    padding-left: 0;
    padding-right: 0;
  }
}
</style>
