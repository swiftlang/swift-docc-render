<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <a
    :href="url"
    :title="`Open source file for ${fileName}`"
    target="_blank"
    class="declaration-source-link"
  >
    <SwiftFileIcon v-if="isSwiftFile" class="declaration-icon" />
    <WordBreak>{{ fileName }}</WordBreak>
  </a>
</template>

<script>
import SwiftFileIcon from 'docc-render/components/Icons/SwiftFileIcon.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';

export default {
  name: 'DeclarationSourceLink',
  components: { WordBreak, SwiftFileIcon },
  props: {
    url: {
      type: String,
      required: true,
    },
    fileName: {
      type: String,
      required: true,
    },
  },
  computed: {
    isSwiftFile: ({ fileName }) => fileName.endsWith('.swift'),
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.declaration-source-link {
  @include font-styles(body-reduced-tight);
  display: flex;
  align-items: center;
  // nudge up, so its closer to the declaration source
  margin-top: -4px;
}

.declaration-icon {
  width: 1em;
  margin-right: 5px;
}
</style>
