<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ul class="relationships-list" :class="classes" ref="apiChangesDiff">
    <li
      v-for="symbol in symbols"
      :key="symbol.identifier"
      class="relationships-item"
    >
      <router-link v-if="symbol.url" class="link" :to="buildUrl(symbol.url, $route.query)">
        <WordBreak tag="code">{{symbol.title}}</WordBreak>
      </router-link>
      <WordBreak v-else tag="code">{{symbol.title}}</WordBreak>
      <ConditionalConstraints
        v-if="symbol.conformance"
        :constraints="symbol.conformance.constraints"
        :prefix="symbol.conformance.conformancePrefix"
      />
    </li>
  </ul>
</template>

<script>
import WordBreak from 'docc-render/components/WordBreak.vue';
import { getAPIChanges, APIChangesMultipleLines } from 'docc-render/mixins/apiChangesHelpers';
import { ChangeTypes } from 'docc-render/constants/Changes';
import { buildUrl } from 'docc-render/utils/url-helper';
import ConditionalConstraints from './ConditionalConstraints.vue';

const MaxInlineItems = 3;

// Maps relationship types to their JSON key in the API Changes JSON.
const RelationshipChangeMapping = {
  conformsTo: 'conformance',
  inheritsFrom: 'inheritance',
  inheritedBy: 'inheritedBy',
};

export default {
  name: 'RelationshipsList',
  components: {
    ConditionalConstraints,
    WordBreak,
  },
  inject: ['store', 'identifier'],
  mixins: [getAPIChanges, APIChangesMultipleLines],
  props: {
    symbols: {
      type: Array,
      required: true,
    },
    type: {
      type: String,
      required: true,
    },
  },
  data() {
    return {
      state: this.store.state,
    };
  },
  computed: {
    classes({ changeType, multipleLinesClass, hasMultipleLinesAfterAPIChanges }) {
      return [
        {
          inline: this.shouldDisplayInline,
          column: !this.shouldDisplayInline,
          [`changed changed-${changeType}`]: !!changeType,
          [multipleLinesClass]: hasMultipleLinesAfterAPIChanges,
        },
      ];
    },
    hasAvailabilityConstraints() {
      return this.symbols.some(symbol => !!(symbol.conformance || {}).constraints);
    },
    changes({ identifier, state: { apiChanges } }) {
      return (apiChanges || {})[identifier] || {};
    },
    changeType({ changes, type }) {
      const relationship = RelationshipChangeMapping[type];

      if (changes.change !== ChangeTypes.modified) {
        return changes.change;
      }

      const changeData = changes[relationship];
      if (!changeData) {
        return undefined;
      }

      const zip = (arr1, arr2) => arr1.map((k, i) => [k, arr2[i]]);

      // check a given "modified" relationship and surface completely new content
      // as an "addition"
      const wasAdded = zip(changeData.previous, changeData.new)
        .some(([previous, current]) => {
          if (previous.content) {
            return previous.content.length === 0 && current.content.length > 0;
          }

          return !!current.content;
        });

      return wasAdded ? ChangeTypes.added : ChangeTypes.modified;
    },
    shouldDisplayInline() {
      const { hasAvailabilityConstraints, symbols } = this;
      return symbols.length <= MaxInlineItems && !hasAvailabilityConstraints;
    },
  },
  methods: {
    buildUrl,
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.relationships-list {
  list-style: none;

  &.column {
    margin-left: 0;
    margin-top: 15px;
  }

  // The "inline" style displays items on a single line as a
  // comma-separated list with a maximum number of 3 items. This style should
  // not be used for a list that contains any items with availability
  // constraints information.
  &.inline {
    display: flex;
    flex-direction: row;
    flex-wrap: wrap;
    margin-top: 15px;
    margin-left: 0;

    li:not(:last-child)::after {
      content: ",\00a0"
    }
  }

  &.changed {
    @include change-highlight-target();

    &:after {
      margin-top: $change-coin-y-offset-reduced;
    }

     // ensure that column layout stays a block content
    &.column {
      display: block;
      box-sizing: border-box;
    }
  }
}

.relationships-list, .relationships-item {
  box-sizing: inherit;
}

.conditional-constraints {
  font-size: rem(14px);
  margin: rem(3px) 0 rem(10px) rem(20px);
}
</style>
