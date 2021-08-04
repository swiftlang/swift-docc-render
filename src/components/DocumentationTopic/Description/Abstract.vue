<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ContentNode v-bind="$props" class="abstract" />
</template>

<script>
import ContentNode from 'docc-render/components/DocumentationTopic/ContentNode.vue';

export default {
  name: 'Abstract',
  components: { ContentNode },
  props: ContentNode.props,
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.abstract {
  @include font-styles(body-large);
}

/deep/ {
  p:last-child {
    margin-bottom: 0;
  }
}
</style>
