<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section>
    <LinkableHeading :anchor="anchor">{{ title }}</LinkableHeading>
    <ParametersTable :parameters="responses" :changes="propertyChanges" key-by="status">
      <template slot="symbol" slot-scope="{ status, type, reason, content, changes }">
        <div class="response-name">
          <code>
            {{ status }}
            <span class="reason">{{ reason }}</span>
          </code>
        </div>
        <PossiblyChangedType
          v-if="!shouldShiftType({ content, reason, status })"
          :type="type"
          :changes="changes.type"
        />
      </template>
      <template
        slot="description"
        slot-scope="{ content, mimetype, reason, type, status, changes }"
      >
        <PossiblyChangedType
          v-if="shouldShiftType({content, reason, status})"
          :type="type"
          :changes="changes.type"
        />
        <div class="response-reason">
          <code>{{ reason }}</code>
        </div>
        <ContentNode v-if="content" :content="content" />
        <PossiblyChangedMimetype
          v-if="mimetype"
          :mimetype="mimetype"
          :changes="changes.mimetype"
          :change="changes.change"
        />
      </template>
    </ParametersTable>
  </section>
</template>

<script>
import { anchorize } from 'docc-render/utils/strings';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';

import apiChangesProvider from 'docc-render/mixins/apiChangesProvider';
import ParametersTable from './ParametersTable.vue';
import PossiblyChangedType from './PossiblyChangedType.vue';
import PossiblyChangedMimetype from './PossiblyChangedMimetype.vue';

export default {
  name: 'RestResponses',
  mixins: [apiChangesProvider],
  components: {
    PossiblyChangedMimetype,
    PossiblyChangedType,
    ContentNode,
    ParametersTable,
    LinkableHeading,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    responses: {
      type: Array,
      required: true,
    },
  },
  computed: {
    anchor: ({ title }) => anchorize(title),
    propertyChanges: ({ apiChanges }) => ((apiChanges || {}).restResponses),
  },
  methods: {
    shouldShiftType:
      ({ content = [], reason, status }) => (!(content.length || reason) && status),
  },
};
</script>

<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.response-name,
.response-reason {
  font-weight: $font-weight-bold;
}

.response-reason {
  @include breakpoint(small) {
    display: none;
  }
}

.response-name > code > .reason {
  display: none;
  @include breakpoint(small) {
    display: initial;
  }
}
</style>
