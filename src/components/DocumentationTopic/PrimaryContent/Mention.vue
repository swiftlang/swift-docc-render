<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div class="link-block">
    <Reference
      :url="url"
      :role="role"
      :kind="kind"
      class="link"
    >
      <TopicLinkBlockIcon class="mention-icon" :role="role" />
      {{ title }}
  </Reference>
  </div>
</template>

<script>
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import TopicLinkBlockIcon from 'docc-render/components/DocumentationTopic/TopicLinkBlockIcon.vue';
import referencesProvider from 'docc-render/mixins/referencesProvider';

export default {
  components: {
    Reference,
    TopicLinkBlockIcon,
  },
  mixins: [referencesProvider],
  props: {
    url: {
      type: String,
      required: true,
    },
    title: {
      type: String,
      required: true,
    },
    role: {
      type: String,
      required: false,
      default: 'article',
    },
    kind: {
      type: String,
      required: false,
      default: 'article',
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.link {
  display: flex;
  margin-bottom: 0.5rem;
}

.link-block, .link {
  box-sizing: inherit;

  &.changed {
    @include change-highlight-target();
    box-sizing: border-box;
  }
}

.mention-icon {
    margin-right: 0.25rem;
}

</style>
