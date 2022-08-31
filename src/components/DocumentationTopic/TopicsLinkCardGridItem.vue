<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <Card
    class="reference-card-grid-item"
    :url="item.url"
    :image="imageReferences.card"
    :title="item.title"
    :content="compact ? []: item.abstract"
    floating-style
    :size="compact ? undefined: 'large'"
    :link-text="compact? '': linkText"
  >
    <template #cover="{ classes }" v-if="!imageReferences.card">
      <div :class="classes" class="reference-card-grid-item__image">
        <TopicTypeIcon
          :type="item.role"
          :image-override="references[imageReferences.icon]"
          class="reference-card-grid-item__icon"
        />
      </div>
    </template>
  </Card>
</template>

<script>
import Card from 'docc-render/components/Card.vue';
import TopicTypeIcon from 'docc-render/components/TopicTypeIcon.vue';
import { TopicRole } from '@/constants/roles';

export const ROLE_LINK_TEXT = {
  [TopicRole.article]: 'Read article',
  [TopicRole.overview]: 'Start tutorial',
  [TopicRole.collection]: 'View API collection',
  [TopicRole.symbol]: 'View symbol',
  [TopicRole.sampleCode]: 'View sample code',
};

export default {
  name: 'TopicsLinkCardGridItem',
  components: { TopicTypeIcon, Card },
  inject: ['references'],
  props: {
    item: {
      type: Object,
      required: true,
    },
    compact: {
      type: Boolean,
      default: true,
    },
  },
  computed: {
    imageReferences: ({ item }) => (item.images || []).reduce((all, current) => {
      // eslint-disable-next-line no-param-reassign
      all[current.type] = current.reference;
      return all;
    }, { icon: null, card: null }),
    linkText: ({ item }) => ROLE_LINK_TEXT[item.role] || 'Learn more',
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.reference-card-grid-item {
  &__image {
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 80px;
    background-color: var(--color-fill-gray-quaternary);
  }

  &__icon {
    display: flex;
    margin: 0;
  }
}
</style>
