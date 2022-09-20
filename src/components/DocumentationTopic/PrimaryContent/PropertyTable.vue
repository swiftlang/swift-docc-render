<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section>
    <LinkableHeading :anchor="anchor">{{ title }}</LinkableHeading>
    <ParametersTable :parameters="properties" :changes="propertyChanges" class="property-table">
      <template slot="symbol" slot-scope="{ name, type, content, changes, deprecated }">
        <div class="property-name" :class="{ deprecated: deprecated }">
          <WordBreak tag="code">{{ name }}</WordBreak>
        </div>
        <PossiblyChangedType
          v-if="!shouldShiftType({name, content})"
          :type="type"
          :changes="changes.type"
        />
      </template>
      <template
        slot="description"
        slot-scope="{
          name,
          type,
          attributes,
          content,
          required,
          changes,
          deprecated,
          readOnly,
        }"
      >
        <PossiblyChangedType
          v-if="shouldShiftType({name, content})"
          :type="type"
          :changes="changes.type"
        />
        <template v-if="deprecated">
          <Badge variant="deprecated" class="property-deprecated" />&nbsp;
        </template>
        <PossiblyChangedTextAttribute
          :changes="changes.required"
          :value="required"
        >(Required) </PossiblyChangedTextAttribute>
        <PossiblyChangedTextAttribute
          :changes="changes.readOnly"
          :value="readOnly"
        >(Read only) </PossiblyChangedTextAttribute>
        <ContentNode v-if="content" :content="content" />
        <ParameterAttributes :attributes="attributes" :changes="changes.attributes" />
      </template>
    </ParametersTable>
  </section>
</template>

<script>
import { anchorize } from 'docc-render/utils/strings';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';

import apiChangesProvider from 'docc-render/mixins/apiChangesProvider';
import Badge from 'docc-render/components/Badge.vue';
import ParametersTable from './ParametersTable.vue';
import ParameterAttributes from './ParameterAttributes.vue';
import PossiblyChangedTextAttribute from './PossiblyChangedTextAttribute.vue';
import PossiblyChangedType from './PossiblyChangedType.vue';

export default {
  name: 'PropertyTable',
  mixins: [apiChangesProvider],
  components: {
    Badge,
    WordBreak,
    PossiblyChangedTextAttribute,
    PossiblyChangedType,
    ParameterAttributes,
    ContentNode,
    ParametersTable,
    LinkableHeading,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    properties: {
      type: Array,
      required: true,
    },
  },
  computed: {
    anchor: ({ title }) => anchorize(title),
    propertyChanges: ({ apiChanges }) => ((apiChanges || {}).properties),
  },
  methods: {
    shouldShiftType: ({ content = [], name }) => (!content.length && name),
  },
};
</script>

<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.property-name {
  font-weight: $font-weight-bold;

  &.deprecated {
    text-decoration: line-through;
  }
}

.property-deprecated {
  margin-left: 0;
}

// The inline display is needed here to allow the optional "Required" text to
// prefix the actual paragraph of any text.
.content {
  display: inline;

  /deep/ p:first-child {
    display: inline;
  }
}
</style>
