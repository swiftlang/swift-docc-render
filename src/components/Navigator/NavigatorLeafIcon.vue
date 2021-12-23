<template>
  <div class="NavigatorLeafIcon">
    <component :is="icon" v-bind="iconProps" class="icon-inline" />
  </div>
</template>

<script>
import SingleLetterSymbolIcon from 'theme/components/Icons/SingleLetterSymbolIcon.vue';
import CurlyBracketsIcon from 'theme/components/Icons/CurlyBracketsIcon.vue';
import TwoLetterSymbolIcon from 'theme/components/Icons/TwoLetterSymbolIcon.vue';
import CollectionIcon from 'theme/components/Icons/CollectionIcon.vue';
import ArticleIcon from 'theme/components/Icons/ArticleIcon.vue';
import PathIcon from 'theme/components/Icons/PathIcon.vue';
import TutorialIcon from 'theme/components/Icons/TutorialIcon.vue';
import { TopicKind } from 'docc-render/constants/kinds';

const KindAliases = {
  [TopicKind.init]: TopicKind.method,
  [TopicKind.typeMethod]: TopicKind.method,
  [TopicKind.typeProperty]: TopicKind.property,
  [TopicKind.enumCase]: TopicKind.enum,
};

const TopicKindIcons = {
  [TopicKind.article]: ArticleIcon,
  [TopicKind.associatedtype]: CollectionIcon,
  [TopicKind.buildSetting]: CollectionIcon,
  [TopicKind.class]: SingleLetterSymbolIcon,
  [TopicKind.dictionarySymbol]: SingleLetterSymbolIcon,
  [TopicKind.container]: CollectionIcon,
  [TopicKind.enum]: SingleLetterSymbolIcon,
  [TopicKind.extension]: TwoLetterSymbolIcon,
  [TopicKind.func]: SingleLetterSymbolIcon,
  [TopicKind.funcOp]: SingleLetterSymbolIcon,
  [TopicKind.httpRequest]: SingleLetterSymbolIcon,
  [TopicKind.languageGroup]: CollectionIcon,
  [TopicKind.learn]: PathIcon,
  [TopicKind.method]: SingleLetterSymbolIcon,
  [TopicKind.macro]: SingleLetterSymbolIcon,
  // [TopicKind.module]: FourSquareIcon,
  [TopicKind.overview]: PathIcon,
  [TopicKind.protocol]: TwoLetterSymbolIcon,
  [TopicKind.property]: SingleLetterSymbolIcon,
  [TopicKind.propertyListKey]: SingleLetterSymbolIcon,
  [TopicKind.propertyListKeyReference]: SingleLetterSymbolIcon,
  [TopicKind.resources]: PathIcon,
  [TopicKind.sampleCode]: CurlyBracketsIcon,
  [TopicKind.struct]: SingleLetterSymbolIcon,
  [TopicKind.subscript]: SingleLetterSymbolIcon,
  [TopicKind.symbol]: CollectionIcon,
  [TopicKind.tutorial]: TutorialIcon,
  [TopicKind.typealias]: SingleLetterSymbolIcon,
  [TopicKind.union]: SingleLetterSymbolIcon,
  [TopicKind.var]: SingleLetterSymbolIcon,
};

const TopicKindProps = {
  [TopicKind.class]: { symbol: 'C', class: 'purple' },
  [TopicKind.dictionarySymbol]: { symbol: 'O', class: 'purple' },
  [TopicKind.enum]: { symbol: 'E', class: 'orange' },
  [TopicKind.extension]: { symbols: ['E', 'x'], class: 'orange' },
  [TopicKind.func]: { symbol: 'ƒ', class: 'green' },
  [TopicKind.funcOp]: { symbol: '⁺⁄₋', class: 'green' },
  [TopicKind.httpRequest]: { symbol: 'E', class: 'green' },
  [TopicKind.method]: { symbol: 'M', class: 'blue' },
  [TopicKind.macro]: { symbol: '#', class: 'pink' },
  [TopicKind.protocol]: { symbols: ['P', 'r'], class: 'purple' },
  [TopicKind.property]: { symbol: 'P', class: 'teal' },
  [TopicKind.propertyListKey]: { symbol: 'K', class: 'green' },
  [TopicKind.propertyListKeyReference]: { symbol: 'K', class: 'green' },
  [TopicKind.struct]: { symbol: 'S', class: 'purple' },
  [TopicKind.subscript]: { symbol: '[ ]', y: 10, class: 'blue' },
  [TopicKind.typealias]: { symbol: 'T', class: 'orange' },
  [TopicKind.union]: { symbol: 'U', class: 'purple' },
  [TopicKind.var]: { symbol: 'V', class: 'purple' },
};

export default {
  name: 'NavigatorLeafIcon',
  components: { SingleLetterSymbolIcon },
  props: {
    kind: {
      type: String,
      required: true,
    },
  },
  computed: {
    normalisedKind: ({ kind }) => KindAliases[kind] || kind,
    icon: ({ normalisedKind }) => TopicKindIcons[normalisedKind] || CollectionIcon,
    iconProps: ({ normalisedKind }) => TopicKindProps[normalisedKind] || {},
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.NavigatorLeafIcon {
  width: 0.8em;
  margin-right: 5px;
  flex: 0 0 auto;
}

.orange {
  color: var(--color-navigator-orange, var(--color-figure-gray-secondary));
}

.green {
  color: var(--color-navigator-green, var(--color-figure-gray-secondary));
}

.blue {
  color: var(--color-navigator-blue, var(--color-figure-gray-secondary));
}

.pink {
  color: var(--color-navigator-pink, var(--color-figure-gray-secondary));
}

.teal {
  color: var(--color-navigator-teal, var(--color-figure-gray-secondary));
}

.purple {
  color: var(--color-navigator-purple, var(--color-figure-gray-secondary));
}
</style>
