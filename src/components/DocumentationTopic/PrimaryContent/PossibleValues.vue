<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <section>
    <LinkableHeading :anchor="contentSectionData.anchor">
      {{ contentSectionData.title }}
    </LinkableHeading>
    <dl class="datalist">
      <template v-for="value in values">
        <dt class="param-name" :key="`${value.name}:name`">
          <WordBreak tag="code">{{ value.name }}</WordBreak>
        </dt>
        <dd v-if="value.content" class="value-content" :key="`${value.name}:content`">
          <ContentNode :content="value.content" />
        </dd>
      </template>
    </dl>
  </section>
</template>

<script>
import ContentNode from 'docc-render/components/ContentNode.vue';
import WordBreak from 'docc-render/components/WordBreak.vue';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';
import { SectionKind } from 'docc-render/constants/PrimaryContentSection';
import { PrimaryContentSectionAnchors } from 'docc-render/constants/ContentSectionAnchors';

export default {
  name: 'PossibleValues',
  components: {
    ContentNode,
    LinkableHeading,
    WordBreak,
  },
  props: {
    values: {
      type: Array,
      required: true,
    },
  },
  computed: {
    contentSectionData: () => PrimaryContentSectionAnchors[SectionKind.possibleValues],
  },
};
</script>
<style lang="scss">
@import 'docc-render/styles/_core.scss';

$param-spacing: rem(28px);
$left-padding: 1rem;

.datalist {
  dd {
    padding-left: $left-padding * 2;
  }

  dt {
    &:first-of-type {
      padding-top: 0;
    }

    font-weight: $font-weight-semibold;
    padding-left: $left-padding;
    padding-top: $param-spacing;
  }
}
</style>
