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
    floating-style
    :size="cardSize"
    :link-text="linkText"
  >
    <template v-if="!imageReferences.card" #cover="{ classes }">
      <div :class="classes" class="reference-card-grid-item__image">
        <TopicTypeIcon
          :type="item.role"
          :image-override="references[imageReferences.icon]"
          class="reference-card-grid-item__icon"
        />
      </div>
    </template>
    <ContentNode v-if="!compact" :content="item.abstract" />
  </Card>
</template>

<script>
import Card from 'docc-render/components/Card.vue';
import TopicTypeIcon from 'docc-render/components/TopicTypeIcon.vue';
import { TopicRole } from 'docc-render/constants/roles';
import CardSize from 'docc-render/constants/CardSize';

export const ROLE_LINK_TEXT = {
  [TopicRole.article]: 'Read article',
  [TopicRole.overview]: 'Start tutorial',
  [TopicRole.collection]: 'View API collection',
  [TopicRole.symbol]: 'View symbol',
  [TopicRole.sampleCode]: 'View sample code',
};

export default {
  name: 'TopicsLinkCardGridItem',
  components: {
    TopicTypeIcon,
    Card,
    ContentNode: () => import('docc-render/components/ContentNode.vue'),
  },
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
      all[current.type] = current.identifier;
      return all;
    }, { icon: null, card: null }),
    linkText: ({ compact, item }) => (compact ? '' : (ROLE_LINK_TEXT[item.role] || 'Learn more')),
    cardSize: ({ compact }) => (compact ? undefined : CardSize.large),
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
    margin: 0;
    display: flex;
    justify-content: center;

    /deep/ .icon-inline {
      flex: 1 1 auto;
    }
  }
}
</style>
