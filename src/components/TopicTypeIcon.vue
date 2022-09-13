<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <IconOverrideProvider
    :imageOverride="imageOverride"
    #default="{ shouldUseOverride, themeId, iconUrl }"
  >
    <div class="TopicTypeIcon">
      <SVGIcon
        v-if="shouldUseOverride"
        v-bind="{ themeId, iconUrl }"
        :style="styles"
        class="icon-inline"
      />
      <component
        v-else
        :is="icon"
        v-bind="iconProps"
        :style="styles"
        class="icon-inline"
      />
    </div>
  </IconOverrideProvider>
</template>

<script>
import PathIcon from 'theme/components/Icons/PathIcon.vue';
import TechnologyIcon from 'theme/components/Icons/TechnologyIcon.vue';
import ArticleIcon from 'theme/components/Icons/ArticleIcon.vue';
import TutorialIcon from 'theme/components/Icons/TutorialIcon.vue';
import TopicFuncIcon from 'theme/components/Icons/TopicFuncIcon.vue';
import CollectionIcon from 'theme/components/Icons/CollectionIcon.vue';
import TopicFuncOpIcon from 'theme/components/Icons/TopicFuncOpIcon.vue';
import CurlyBracketsIcon from 'theme/components/Icons/CurlyBracketsIcon.vue';
import TopicSubscriptIcon from 'theme/components/Icons/TopicSubscriptIcon.vue';
import TwoLetterSymbolIcon from 'theme/components/Icons/TwoLetterSymbolIcon.vue';
import SingleLetterSymbolIcon from 'theme/components/Icons/SingleLetterSymbolIcon.vue';
import { TopicTypes, TopicTypeAliases } from 'docc-render/constants/TopicTypes';
import { HeroColorsMap } from 'docc-render/constants/HeroColors';
import SVGIcon from 'docc-render/components/SVGIcon.vue';
import IconOverrideProvider from 'docc-render/components/IconOverrideProvider.vue';

const TopicTypeIcons = {
  [TopicTypes.article]: ArticleIcon,
  [TopicTypes.associatedtype]: CollectionIcon,
  [TopicTypes.buildSetting]: CollectionIcon,
  [TopicTypes.class]: SingleLetterSymbolIcon,
  [TopicTypes.collection]: CollectionIcon,
  [TopicTypes.dictionarySymbol]: SingleLetterSymbolIcon,
  [TopicTypes.container]: CollectionIcon,
  [TopicTypes.enum]: SingleLetterSymbolIcon,
  [TopicTypes.extension]: TwoLetterSymbolIcon,
  [TopicTypes.func]: TopicFuncIcon,
  [TopicTypes.op]: TopicFuncOpIcon,
  [TopicTypes.httpRequest]: SingleLetterSymbolIcon,
  [TopicTypes.languageGroup]: CollectionIcon,
  [TopicTypes.learn]: PathIcon,
  [TopicTypes.method]: SingleLetterSymbolIcon,
  [TopicTypes.macro]: SingleLetterSymbolIcon,
  [TopicTypes.module]: TechnologyIcon,
  [TopicTypes.overview]: PathIcon,
  [TopicTypes.protocol]: TwoLetterSymbolIcon,
  [TopicTypes.property]: SingleLetterSymbolIcon,
  [TopicTypes.propertyListKey]: SingleLetterSymbolIcon,
  [TopicTypes.resources]: PathIcon,
  [TopicTypes.sampleCode]: CurlyBracketsIcon,
  [TopicTypes.struct]: SingleLetterSymbolIcon,
  [TopicTypes.subscript]: TopicSubscriptIcon,
  [TopicTypes.symbol]: CollectionIcon,
  [TopicTypes.tutorial]: TutorialIcon,
  [TopicTypes.typealias]: SingleLetterSymbolIcon,
  [TopicTypes.union]: SingleLetterSymbolIcon,
  [TopicTypes.var]: SingleLetterSymbolIcon,
};

const TopicTypeProps = {
  [TopicTypes.class]: { symbol: 'C' },
  [TopicTypes.dictionarySymbol]: { symbol: 'O' },
  [TopicTypes.enum]: { symbol: 'E' },
  [TopicTypes.extension]: { first: 'E', second: 'x' },
  [TopicTypes.httpRequest]: { symbol: 'E' },
  [TopicTypes.method]: { symbol: 'M' },
  [TopicTypes.macro]: { symbol: '#' },
  [TopicTypes.protocol]: { first: 'P', second: 'r' },
  [TopicTypes.property]: { symbol: 'P' },
  [TopicTypes.propertyListKey]: { symbol: 'K' },
  [TopicTypes.struct]: { symbol: 'S' },
  [TopicTypes.typealias]: { symbol: 'T' },
  [TopicTypes.union]: { symbol: 'U' },
  [TopicTypes.var]: { symbol: 'V' },
};

export default {
  name: 'TopicTypeIcon',
  components: { IconOverrideProvider, SVGIcon, SingleLetterSymbolIcon },
  constants: { TopicTypeIcons, TopicTypeProps },
  props: {
    type: {
      type: String,
      required: true,
    },
    withColors: {
      type: Boolean,
      default: false,
    },
    imageOverride: {
      type: Object,
      default: null,
    },
  },
  computed: {
    normalisedType: ({ type }) => TopicTypeAliases[type] || type,
    icon: ({ normalisedType }) => TopicTypeIcons[normalisedType] || CollectionIcon,
    iconProps: ({ normalisedType }) => TopicTypeProps[normalisedType] || {},
    color: ({ normalisedType }) => HeroColorsMap[normalisedType],
    styles: ({
      color,
      withColors,
    }) => (withColors && color ? { color: `var(--color-type-icon-${color})` } : {}),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.TopicTypeIcon {
  width: 1em;
  height: 1em;
  margin-right: 7px;
  flex: 0 0 auto;
  color: var(--color-figure-gray-secondary);

  svg {
    width: 100%;
    height: 100%;
  }
}
</style>
