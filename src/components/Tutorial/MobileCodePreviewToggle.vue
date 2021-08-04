<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <span class="toggle-preview">
    <a
      v-if="isActionable"
      href="#"
      class="toggle-text"
      @click.prevent="$emit('click')"
    >
      Preview
      <InlinePlusCircleIcon class="toggle-icon icon-inline" />
    </a>
    <span class="toggle-text" v-else>
      No preview
    </span>
  </span>
</template>

<script>

import InlinePlusCircleIcon from 'theme/components/Icons/InlinePlusCircleIcon.vue';

export default {
  name: 'MobileCodePreviewToggle',
  components: { InlinePlusCircleIcon },
  props: {
    // Whether the toggle can be clicked. If set, a 'click'
    // event will be emitted when the toggle is clicked.
    isActionable: {
      type: Boolean,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import "docc-render/styles/_core.scss";

.toggle-preview {
  color: var(--color-runtime-preview-disabled-text);
  display: flex;
  align-items: center;
}

a {
  color: var(--url, var(--color-link));
}

.toggle-text {
  display: flex;
  align-items: center;
}

svg.toggle-icon {
  width: 1em;
  height: 1em;
  margin-left: .5em;
}
</style>
