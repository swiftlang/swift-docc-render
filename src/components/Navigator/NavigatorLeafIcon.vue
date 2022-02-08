<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="NavigatorLeafIcon">
    <component :is="icon" v-bind="iconProps" class="icon-inline" :style="styles" />
  </div>
</template>

<script>
import PathIcon from 'theme/components/Icons/PathIcon.vue';
import ModuleIcon from 'theme/components/Icons/ModuleIcon.vue';
import ArticleIcon from 'theme/components/Icons/ArticleIcon.vue';
import TutorialIcon from 'theme/components/Icons/TutorialIcon.vue';
import TopicFuncIcon from 'theme/components/Icons/TopicFuncIcon.vue';
import CollectionIcon from 'theme/components/Icons/CollectionIcon.vue';
import TopicFuncOpIcon from 'theme/components/Icons/TopicFuncOpIcon.vue';
import CurlyBracketsIcon from 'theme/components/Icons/CurlyBracketsIcon.vue';
import TopicSubscriptIcon from 'theme/components/Icons/TopicSubscriptIcon.vue';
import TwoLetterSymbolIcon from 'theme/components/Icons/TwoLetterSymbolIcon.vue';
import SingleLetterSymbolIcon from 'theme/components/Icons/SingleLetterSymbolIcon.vue';
import { TopicKind, TopicKindAliases, TopicKindColorsMap } from 'docc-render/constants/kinds';

export const TopicKindIcons = {
  [TopicKind.article]: ArticleIcon,
  [TopicKind.associatedtype]: CollectionIcon,
  [TopicKind.buildSetting]: CollectionIcon,
  [TopicKind.class]: SingleLetterSymbolIcon,
  [TopicKind.dictionarySymbol]: SingleLetterSymbolIcon,
  [TopicKind.container]: CollectionIcon,
  [TopicKind.enum]: SingleLetterSymbolIcon,
  [TopicKind.extension]: TwoLetterSymbolIcon,
  [TopicKind.func]: TopicFuncIcon,
  [TopicKind.funcOp]: TopicFuncOpIcon,
  [TopicKind.httpRequest]: SingleLetterSymbolIcon,
  [TopicKind.languageGroup]: CollectionIcon,
  [TopicKind.learn]: PathIcon,
  [TopicKind.method]: SingleLetterSymbolIcon,
  [TopicKind.macro]: SingleLetterSymbolIcon,
  [TopicKind.module]: ModuleIcon,
  [TopicKind.overview]: PathIcon,
  [TopicKind.protocol]: TwoLetterSymbolIcon,
  [TopicKind.property]: SingleLetterSymbolIcon,
  [TopicKind.propertyListKey]: SingleLetterSymbolIcon,
  [TopicKind.resources]: PathIcon,
  [TopicKind.sampleCode]: CurlyBracketsIcon,
  [TopicKind.struct]: SingleLetterSymbolIcon,
  [TopicKind.subscript]: TopicSubscriptIcon,
  [TopicKind.symbol]: CollectionIcon,
  [TopicKind.tutorial]: TutorialIcon,
  [TopicKind.typealias]: SingleLetterSymbolIcon,
  [TopicKind.union]: SingleLetterSymbolIcon,
  [TopicKind.var]: SingleLetterSymbolIcon,
};

export const TopicKindProps = {
  [TopicKind.class]: { symbol: 'C' },
  [TopicKind.dictionarySymbol]: { symbol: 'O' },
  [TopicKind.enum]: { symbol: 'E' },
  [TopicKind.extension]: { symbols: ['E', 'x'] },
  [TopicKind.httpRequest]: { symbol: 'E' },
  [TopicKind.method]: { symbol: 'M' },
  [TopicKind.macro]: { symbol: '#' },
  [TopicKind.protocol]: { symbols: ['P', 'r'] },
  [TopicKind.property]: { symbol: 'P' },
  [TopicKind.propertyListKey]: { symbol: 'K' },
  [TopicKind.struct]: { symbol: 'S' },
  [TopicKind.typealias]: { symbol: 'T' },
  [TopicKind.union]: { symbol: 'U' },
  [TopicKind.var]: { symbol: 'V' },
};

export default {
  name: 'NavigatorLeafIcon',
  components: { SingleLetterSymbolIcon },
  props: {
    kind: {
      type: String,
      required: true,
    },
    withColors: {
      type: Boolean,
      default: false,
    },
  },
  computed: {
    normalisedKind: ({ kind }) => TopicKindAliases[kind] || kind,
    icon: ({ normalisedKind }) => TopicKindIcons[normalisedKind] || CollectionIcon,
    iconProps: ({ normalisedKind }) => TopicKindProps[normalisedKind] || {},
    color: ({ normalisedKind }) => TopicKindColorsMap[normalisedKind],
    styles: ({ color, withColors }) => (withColors && color ? { color: `var(--color-kind-icon-${color})` } : {}),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.NavigatorLeafIcon {
  width: 1em;
  height: 1em;
  margin-right: 5px;
  flex: 0 0 auto;
  color: var(--color-figure-gray-secondary);

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
