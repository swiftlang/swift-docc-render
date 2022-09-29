<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <TopicsTable
    :anchor="contentSectionData.anchor"
    :title="contentSectionData.title"
    :isSymbolDeprecated="isSymbolDeprecated"
    :isSymbolBeta="isSymbolBeta"
    :sections="sections"
  />
</template>

<script>
import { MainContentSectionAnchors } from 'docc-render/constants/ContentSectionAnchors';
import TopicsTable from './TopicsTable.vue';

export default {
  name: 'SeeAlso',
  components: { TopicsTable },
  props: {
    isSymbolDeprecated: Boolean,
    isSymbolBeta: Boolean,
    sections: TopicsTable.props.sections,
  },
  computed: {
    contentSectionData: () => MainContentSectionAnchors.seeAlso,
  },
};
</script>
