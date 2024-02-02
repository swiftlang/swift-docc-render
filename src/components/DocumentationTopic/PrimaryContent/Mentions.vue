<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section v-if="topics.length" class="mentions">
    <LinkableHeading anchor="mentions">
      {{$t('mentioned-in')}}
    </LinkableHeading>
    <Mention v-for="topic in topics"
      :key="topic.identifier"
      :url="topic.url"
      :title="topic.title"
      :role="topic.role"
      :kind="topic.kind"
    />
  </section>
</template>

<script>
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';
import Mention from 'docc-render/components/DocumentationTopic/PrimaryContent/Mention.vue';
import referencesProvider from 'docc-render/mixins/referencesProvider';

export default {
  name: 'MentionedIn',
  components: {
    LinkableHeading,
    Mention,
  },
  mixins: [referencesProvider],
  props: {
    mentions: {
      type: Array,
      required: true,
    },
  },
  computed: {
    topics() {
      if (this.mentions && this.mentions.length) {
        return this.mentions
          .slice(0, 5)
          .flatMap(mention => this.references[mention]);
      }
      return [];
    },
  },
};
</script>
