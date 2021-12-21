<template>
  <div class="NavigatorLeafIcon">
    <component :is="icon" v-bind="iconProps" class="icon-inline" />
  </div>
</template>

<script>
import SingleLetterSymbolIcon from 'docc-render/components/Icons/SingleLetterSymbolIcon.vue';
import CurlyBracketsIcon from 'theme/components/Icons/CurlyBracketsIcon.vue';
import TwoLetterSymbolIcon from 'docc-render/components/Icons/TwoLetterSymbolIcon.vue';
import CollectionIcon from 'docc-render/components/Icons/CollectionIcon.vue';
import { TopicRoleIcons } from 'docc-render/components/DocumentationTopic/TopicLinkBlockIcon.vue';
import { TopicKind } from 'docc-render/constants/kinds';

const KindAliases = {
  [TopicKind.init]: TopicKind.method,
  [TopicKind.typeMethod]: TopicKind.method,
  [TopicKind.typeProperty]: TopicKind.property,
  [TopicKind.enumCase]: TopicKind.enum,
};

const TopicKindIcons = {
  ...TopicRoleIcons,
  [TopicKind.subscript]: CurlyBracketsIcon,
  [TopicKind.struct]: SingleLetterSymbolIcon,
  [TopicKind.method]: SingleLetterSymbolIcon,
  [TopicKind.protocol]: TwoLetterSymbolIcon,
  [TopicKind.property]: SingleLetterSymbolIcon,
  [TopicKind.enum]: SingleLetterSymbolIcon,
  [TopicKind.symbol]: CollectionIcon,
  [TopicKind.class]: SingleLetterSymbolIcon,
  [TopicKind.typealias]: SingleLetterSymbolIcon,
  [TopicKind.var]: SingleLetterSymbolIcon,
  [TopicKind.associatedtype]: CollectionIcon,
  [TopicKind.buildSetting]: CollectionIcon,
};

const TopicRoleProps = {
  [TopicKind.struct]: { word: 'Struct' },
  [TopicKind.method]: { word: 'Method', color: '#272AD8' },
  [TopicKind.protocol]: { word: 'Protocol' },
  [TopicKind.property]: { word: 'Property', color: '#509CA3' },
  [TopicKind.enum]: { word: 'Enum', color: '#947100' },
  [TopicKind.typealias]: { word: 'Typealias', color: '#947100' },
  [TopicKind.class]: { word: 'Class' },
  [TopicKind.var]: { word: 'Var' },
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
    icon: ({ normalisedKind }) => TopicKindIcons[normalisedKind],
    iconProps: ({ normalisedKind }) => TopicRoleProps[normalisedKind] || {},
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
</style>
