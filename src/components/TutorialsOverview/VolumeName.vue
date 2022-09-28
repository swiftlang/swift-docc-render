<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="volume-name">
    <Asset v-if="image" :identifier="image" class="image" aria-hidden="true" />
    <h2 class="name">
      {{ name }}
    </h2>
    <ContentNode v-if="content" :content="content" />
  </div>
</template>
<script>
import Asset from 'docc-render/components/Asset.vue';
import ContentNode from 'docc-render/components/ContentNode.vue';

export default {
  name: 'VolumeName',
  components: { ContentNode, Asset },
  props: {
    image: {
      type: String,
      required: false,
    },
    content: {
      type: Array,
      required: false,
    },
    name: {
      type: String,
      required: false,
    },
  },
};
</script>
<style lang="scss" scoped>
@import 'docc-render/styles/_core.scss';

.image {
  margin-bottom: 10px;
}

.name {
  @include font-styles(heading-2-reduced);
  color: var(--color-tutorials-overview-header-text, light-color(fill-tertiary));
  word-break: break-word;
}

.content {
  @include font-styles(body-tight);
  color: var(--color-tutorials-overview-content-alt);
  margin-top: 10px;
}

.volume-name {
  padding: 50px 60px;
  text-align: center;
  background: var(--color-tutorials-overview-fill-secondary, dark-color(fill-secondary));
  margin: $tutorials-overview-tile-margin-single-side 0;

  @include breakpoint(small) {
    padding: 40px 20px;
  }
}
</style>
