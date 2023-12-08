<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="primary-content">
    <component
      v-for="(section, i) in sections"
      v-bind="propsFor(section)"
      :is="componentFor(section)"
      :key="i"
    />
  </div>
</template>

<script>
import PossibleValues
  from 'docc-render/components/DocumentationTopic/PrimaryContent/PossibleValues.vue';
import RestEndpoint
  from 'docc-render/components/DocumentationTopic/PrimaryContent/RestEndpoint.vue';
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';
import { SectionKind } from 'docc-render/constants/PrimaryContentSection';
import PropertyListKeyDetails from './PrimaryContent/PropertyListKeyDetails.vue';
import Parameters from './PrimaryContent/Parameters.vue';
import PropertyTable from './PrimaryContent/PropertyTable.vue';
import RestBody from './PrimaryContent/RestBody.vue';
import RestParameters from './PrimaryContent/RestParameters.vue';
import RestResponses from './PrimaryContent/RestResponses.vue';

export default {
  name: 'PrimaryContent',
  components: {
    ContentNode,
    Parameters,
    PropertyListKeyDetails,
    PropertyTable,
    RestBody,
    RestEndpoint,
    RestParameters,
    RestResponses,
    PossibleValues,
  },
  constants: { SectionKind },
  props: {
    sections: {
      type: Array,
      required: true,
      validator: sections => sections.every(({ kind }) => (
        Object.prototype.hasOwnProperty.call(SectionKind, kind)
      )),
    },
  },
  computed: {
    span() {
      return {
        large: 9,
        medium: 9,
        small: 12,
      };
    },
  },
  methods: {
    componentFor(section) {
      return {
        [SectionKind.content]: ContentNode,
        [SectionKind.details]: PropertyListKeyDetails,
        [SectionKind.parameters]: Parameters,
        [SectionKind.properties]: PropertyTable,
        [SectionKind.restBody]: RestBody,
        [SectionKind.restParameters]: RestParameters,
        [SectionKind.restHeaders]: RestParameters,
        [SectionKind.restCookies]: RestParameters,
        [SectionKind.restEndpoint]: RestEndpoint,
        [SectionKind.restResponses]: RestResponses,
        [SectionKind.possibleValues]: PossibleValues,
      }[section.kind];
    },
    propsFor(section) {
      const {
        bodyContentType,
        content,
        details,
        items,
        kind,
        mimeType,
        parameters,
        title,
        tokens,
        values,
      } = section;
      return {
        [SectionKind.content]: { content },
        [SectionKind.details]: { details },
        [SectionKind.parameters]: { parameters },
        [SectionKind.possibleValues]: { values },
        [SectionKind.properties]: { properties: items, title },
        [SectionKind.restBody]: {
          bodyContentType,
          content,
          mimeType,
          parts: parameters,
          title,
        },
        [SectionKind.restCookies]: { parameters: items, title },
        [SectionKind.restEndpoint]: { tokens, title },
        [SectionKind.restHeaders]: { parameters: items, title },
        [SectionKind.restParameters]: { parameters: items, title },
        [SectionKind.restResponses]: { responses: items, title },
      }[kind];
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.primary-content {
  &.with-border::before {
    border-top-color: var(--colors-grid, var(--color-grid));
    border-top-style: solid;
    border-top-width: var(--content-table-title-border-width, 1px);
    content: '';
    display: block;
  }

  :deep() {
    & > * {
      margin-bottom: $section-spacing-single-side;
      margin-top: $section-spacing-single-side;

      &:first-child {
        margin-top: $contenttable-spacing-single-side;
      }
    }
  }
}
</style>
