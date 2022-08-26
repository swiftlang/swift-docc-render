<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="TopicsGrid">
    <ContentTable anchor="topics" title="Topics">
      <ContentTableSection
        v-for="section in sections"
        :key="section.title"
        :title="section.title || ''"
      >
        <TopicsLinkCardGrid
          :identifiers="section.identifiers"
          :topicStyle="topicStyle"
          class="topic-grid"
        />
      </ContentTableSection>
    </ContentTable>
  </div>
</template>

<script>
import { anchorize } from 'docc-render/utils/strings';

import TopicsLinkCardGrid from 'docc-render/components/DocumentationTopic/TopicsLinkCardGrid.vue';
import ContentTable from 'docc-render/components/DocumentationTopic/ContentTable.vue';
import ContentTableSection from 'docc-render/components/DocumentationTopic/ContentTableSection.vue';

export default {
  name: 'TopicsGrid',
  components: { ContentTableSection, ContentTable, TopicsLinkCardGrid },
  props: {
    sections: {
      type: Array,
      required: true,
    },
    topicStyle: {
      type: String,
      required: true,
    },
  },
  methods: {
    anchorize,
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.topic-grid {
  margin-top: $stacked-margin-xlarge;
}
</style>
