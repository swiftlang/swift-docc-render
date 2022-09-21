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
    <ParametersTable :parameters="parameters" :changes="parameterChanges">
      <template slot="symbol" slot-scope="{ name, type, content, changes, deprecated }">
        <div class="param-name" :class="{ deprecated: deprecated }">
          <WordBreak tag="code">{{ name }}</WordBreak>
        </div>
        <PossiblyChangedType
          v-if="!shouldShiftType({content, name})"
          :type="type"
          :changes="changes.type"
        />
      </template>
      <template
        slot="description"
        slot-scope="{ name, type, content, required, attributes, changes, deprecated, readOnly }"
      >
        <div>
          <PossiblyChangedType
            v-if="shouldShiftType({content, name})"
            :type="type"
            :changes="changes.type"
          />
          <template v-if="deprecated">
            <Badge variant="deprecated" class="param-deprecated" />&nbsp;
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
          <ParameterAttributes :attributes="attributes" :changes="changes" />
        </div>
      </template>
    </ParametersTable>
  </section>
</template>

<script>
import { anchorize } from 'docc-render/utils/strings';
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';

import WordBreak from 'docc-render/components/WordBreak.vue';
import apiChangesProvider from 'docc-render/mixins/apiChangesProvider';
import Badge from 'docc-render/components/Badge.vue';
import ParametersTable from './ParametersTable.vue';
import ParameterAttributes from './ParameterAttributes.vue';
import PossiblyChangedTextAttribute from './PossiblyChangedTextAttribute.vue';
import PossiblyChangedType from './PossiblyChangedType.vue';

export default {
  name: 'RestParameters',
  mixins: [apiChangesProvider],
  components: {
    Badge,
    PossiblyChangedType,
    PossiblyChangedTextAttribute,
    ParameterAttributes,
    WordBreak,
    ContentNode,
    ParametersTable,
    LinkableHeading,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    parameters: {
      type: Array,
      required: true,
    },
  },
  computed: {
    anchor: ({ title }) => anchorize(title),
    parameterChanges: ({ apiChanges }) => ((apiChanges || {}).restParameters),
  },
  methods: {
    shouldShiftType: ({ content = [], name }) => (!content.length && name),
  },
};
</script>

<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.param-name {
  font-weight: $font-weight-bold;

  &.deprecated {
    text-decoration: line-through;
  }
}

.param-deprecated {
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
