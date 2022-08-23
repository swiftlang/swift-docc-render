<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="TopicsGrid">
    <OnThisPageSection
      v-for="(section, i) in sections"
      :key="i"
      :title="section.title || ''"
      :anchor="anchorize(section.title || '')"
      :level="3"
      class="topic-grid"
    >
      <div class="container">
        <h3 class="title" v-if="section.title">
          {{ section.title }}
        </h3>
        <TopicsLinkCardGrid :identifiers="section.identifiers" :topicStyle="topicStyle" />
      </div>
    </OnThisPageSection>
  </div>
</template>

<script>
import { anchorize } from 'docc-render/utils/strings';

import TopicsLinkCardGrid from 'docc-render/components/DocumentationTopic/TopicsLinkCardGrid.vue';
import OnThisPageSection from 'docc-render/components/DocumentationTopic/OnThisPageSection.vue';

export default {
  name: 'TopicsGrid',
  components: { OnThisPageSection, TopicsLinkCardGrid },
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

.container {
  @include dynamic-content-container
}

.title {
  @include font-styles(label);
}

.topic-grid + .topic-grid {
  margin-top: $stacked-margin-large;
}
</style>
