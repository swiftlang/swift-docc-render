<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section class="details">
    <LinkableHeading :anchor="contentSectionData.anchor">
      {{ contentSectionData.title }}
    </LinkableHeading>
    <dl>
      <template v-if="isSymbol">
        <dt class="detail-type" :key="`${details.name}:name`">
          Name
        </dt>
        <dd class="detail-content" :key="`${details.ideTitle}:content`">
          {{ details.ideTitle }}
        </dd>
      </template>
      <template v-if="isTitle">
        <dt class="detail-type" :key="`${details.name}:key`">
          Key
        </dt>
        <dd class="detail-content" :key="`${details.ideTitle}:content`">
          {{ details.name }}
        </dd>
      </template>
      <dt class="detail-type" :key="`${details.name}:type`">
        Type
      </dt>
      <dd class="detail-content">
        <PropertyListKeyType :types="details.value" />
      </dd>
    </dl>
  </section>
</template>

<script>
import PropertyListKeyType
  from 'docc-render/components/DocumentationTopic/PrimaryContent/PropertyListKeyType.vue';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';
import { PrimaryContentSectionAnchors } from 'docc-render/constants/ContentSectionAnchors';
import { SectionKind } from 'docc-render/constants/PrimaryContentSection';

export default {
  name: 'PropertyListKeyDetails',
  components: {
    PropertyListKeyType,
    LinkableHeading,
  },
  props: {
    details: {
      type: Object,
      required: true,
    },
  },
  computed: {
    contentSectionData: () => PrimaryContentSectionAnchors[SectionKind.details],
    isTitle() {
      return this.details.titleStyle === 'title' && this.details.ideTitle;
    },
    isSymbol() {
      return this.details.titleStyle === 'symbol' && this.details.ideTitle;
    },
  },
};

</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$param-spacing: rem(28px);

.detail-type {
  font-weight: $font-weight-semibold;
  padding-left: 1rem;
  padding-top: $param-spacing;

  &:first-child {
    padding-top: 0;
  }

  @include breakpoint(small) {
    padding-left: 0;
  }
}

.detail-content {
  padding-left: 2rem;

  @include breakpoint(small) {
    padding-left: 0;
  }
}
</style>
