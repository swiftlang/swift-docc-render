<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="DictionaryExample">
    <slot />
    <CollapsibleCodeListing
      :content="example.content"
      showLineNumbers
    />
  </div>
</template>

<script>
import CollapsibleCodeListing from 'docc-render/components/ContentNode/CollapsibleCodeListing.vue';

export default {
  name: 'DictionaryExample',
  components: {
    CollapsibleCodeListing,
  },
  props: {
    example: {
      type: Object,
      required: true,
    },
  },
};
</script>
