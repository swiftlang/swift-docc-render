<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ContentTable
    :anchor="contentSectionData.anchor"
    :title="contentSectionData.title"
  >
    <Section
      v-for="section in sectionsWithSymbols"
      :key="section.type"
      :title="section.title"
      :anchor="section.anchor"
    >
      <List :symbols="section.symbols" :type="section.type" />
    </Section>
  </ContentTable>
</template>

<script>
import { MainContentSectionAnchors } from 'docc-render/constants/ContentSectionAnchors';
import ContentTable from './ContentTable.vue';
import ContentTableSection from './ContentTableSection.vue';
import RelationshipsList from './RelationshipsList.vue';

export default {
  name: 'Relationships',
  inject: {
    references: {
      default() {
        return {};
      },
    },
  },
  components: {
    ContentTable,
    List: RelationshipsList,
    Section: ContentTableSection,
  },
  props: {
    sections: {
      type: Array,
      required: true,
    },
  },
  computed: {
    contentSectionData: () => MainContentSectionAnchors.relationships,
    sectionsWithSymbols() {
      return this.sections.map(section => ({
        ...section,
        symbols: section.identifiers.reduce((list, id) => (
          this.references[id] ? (
            list.concat(this.references[id])
          ) : (
            list
          )
        ), []),
      }));
    },
  },
};
</script>
