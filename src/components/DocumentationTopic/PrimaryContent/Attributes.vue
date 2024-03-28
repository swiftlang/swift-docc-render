<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section class="attributes">
    <LinkableHeading :anchor="section.anchor" :level="section.level">
      {{ $t(section.title) }}
    </LinkableHeading>
    <ParameterAttributes :attributes="attributes" />
  </section>
</template>

<script>
import { PrimaryContentSectionAnchors } from 'docc-render/constants/ContentSectionAnchors';
import { SectionKind } from 'docc-render/constants/PrimaryContentSection';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';
import ParameterAttributes from 'docc-render/components/DocumentationTopic/PrimaryContent/ParameterAttributes.vue';

export default {
  name: 'Attributes',
  components: {
    LinkableHeading,
    ParameterAttributes,
  },
  props: {
    attributes: {
      type: Array,
      required: true,
    },
  },
  computed: {
    section: ({ sectionKind }) => PrimaryContentSectionAnchors[sectionKind],
    sectionKind: () => SectionKind.attributes,
  },
};
</script>

<style scoped lang="scss">
@import '@/styles/_core.scss';

.parameter-attributes {
  margin-left: 1rem;
}

:deep(.property-metadata) {
  color: currentColor;
}
</style>
