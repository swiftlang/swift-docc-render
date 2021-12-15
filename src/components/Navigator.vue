<template>
  <div class="navigator">
    <input type="text" :value="filter" @input="debounceInput">
    <NavigatorCard
      v-for="technology in filteredTree"
      :key="technology.path"
      :technology="technology"
      :active-path="activePath"
      @open="handleOpenOnCard"
    />
  </div>
</template>

<script>
import { fetchIndexPathsData } from 'docc-render/utils/data';
import Language from 'docc-render/constants/Language';
import NavigatorCard from 'docc-render/components/Navigator/NavigatorCard.vue';
import debounce from 'docc-render/utils/debounce';

export default {
  name: 'Navigator',
  components: { NavigatorCard },
  props: {
    interfaceLanguage: {
      type: String,
      default: Language.swift.key.url,
    },
    parentTopicIdentifiers: {
      type: Array,
      required: true,
    },
  },
  inject: ['references'],
  data() {
    return {
      navigationIndex: {},
      filter: '',
    };
  },
  computed: {
    technologiesTree({ navigationIndex, interfaceLanguage }) {
      return navigationIndex[interfaceLanguage];
    },
    filteredTree({ technologiesTree, filter }) {
      if (!filter.length) {
        return technologiesTree;
      }
      return technologiesTree.reduce(this.getNodes, []);
    },
    parentTopicReferences({ references, parentTopicIdentifiers }) {
      return parentTopicIdentifiers.map(identifier => references[identifier].url);
    },
    activePath({ parentTopicReferences, $route }) {
      return parentTopicReferences.concat($route.path);
    },
  },
  async created() {
    const { languages } = await fetchIndexPathsData();
    this.navigationIndex = languages;
  },
  methods: {
    getNodes(result, object) {
      if (object.title.toLowerCase().includes(this.filter.toLowerCase())) {
        result.push(object);
        return result;
      }
      if (object.children) {
        const children = object.children.reduce(this.getNodes, []);
        if (children.length) result.push({ ...object, children, expanded: true });
      }
      return result;
    },
    debounceInput: debounce(function debounceInput({ target: { value } }) {
      this.filter = value;
    }, 500),
    // TODO: Add logic to fetch children async
    handleOpenOnCard(paths) {
      console.log(paths);
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.navigator {
  overflow: hidden auto;
  position: sticky;
  top: $nav-height;
  max-height: calc(100vh - #{$nav-height});
}
</style>
