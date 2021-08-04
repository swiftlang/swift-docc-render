<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <span class="filename">
    <a
      v-if="isActionable"
      href="#"
      @click.prevent="$emit('click')"
    >
      <FileIcon :fileType="fileType" />
      <slot />
    </a>
    <span v-else>
      <FileIcon :fileType="fileType" />
      <slot />
    </span>
  </span>
</template>

<script>
import CodeListingFileIcon from './CodeListingFileIcon.vue';

export default {
  name: 'CodeListingFilename',
  components: { FileIcon: CodeListingFileIcon },
  props: {
    // Whether the file name can be clicked. If set, a 'click'
    // event to be emitted when the file name is clicked.
    isActionable: {
      type: Boolean,
      default: () => false,
    },
    fileType: String,
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.filename {
  color: var(--text, var(--colors-secondary-label, var(--color-secondary-label)));
  @include font-styles(code-preview-filename);
  margin-top: 1rem;

  @include breakpoint(small) {
    margin-top: 0;
  }

  > a, > span {
    display: flex;
    align-items: center;
    line-height: initial;
  }
}

a {
  color: var(--url, var(--color-link));
}
</style>
