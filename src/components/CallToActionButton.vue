<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <DestinationDataProvider v-if="action" :destination="action" v-slot="{ url, title }">
    <ButtonLink
      :url="normalizePath(url)"
      :isDark="isDark"
    >
      {{ title }}
    </ButtonLink>
  </DestinationDataProvider>
</template>
<script>

import ButtonLink from 'docc-render/components/ButtonLink.vue';
import DestinationDataProvider from 'docc-render/components/DestinationDataProvider.vue';
import { normalizePath } from 'docc-render/utils/assets';

export default {
  name: 'CallToActionButton',
  components: {
    DestinationDataProvider,
    ButtonLink,
  },
  methods: {
    normalizePath,
  },
  props: {
    action: {
      type: Object,
      required: true,
    },
    isDark: {
      type: Boolean,
      default: false,
    },
  },
};
</script>
