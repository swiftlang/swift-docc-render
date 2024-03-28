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
  </section>
</template>

<script>
import { PrimaryContentSectionAnchors } from 'docc-render/constants/ContentSectionAnchors';
import { SectionKind } from 'docc-render/constants/PrimaryContentSection';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';

export default {
  name: 'Attributes',
  components: { LinkableHeading },
  computed: {
    section: ({ sectionKind }) => PrimaryContentSectionAnchors[sectionKind],
    sectionKind: () => SectionKind.attributes,
  },
};
</script>
