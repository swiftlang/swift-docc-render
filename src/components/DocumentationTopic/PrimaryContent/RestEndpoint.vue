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
    <DeclarationSource :tokens="tokens" />
  </section>
</template>

<script>
import { anchorize } from 'docc-render/utils/strings';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';
import DeclarationSource
  from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationSource.vue';

/**
 * @module RestEndpoint
 */
export default {
  name: 'RestEndpoint',
  components: {
    DeclarationSource,
    LinkableHeading,
  },
  props: {
    title: {
      type: String,
      required: true,
    },
    tokens: {
      type: Array,
      required: true,
    },
  },
  computed: {
    anchor: ({ title }) => anchorize(title),
  },
};
</script>
