<template>
  <div class="navigator">
    <input type="text" :value="filter" @input="debounceInput">
    <NavigatorCard
      :technology="technology.title"
      :children="filteredTree"
      :active-path="activePath"
      :show-extended-info="showExtraInfo"
      :filter-pattern="filterPattern"
    />
  </div>
</template>

<script>
import NavigatorCard from 'docc-render/components/Navigator/NavigatorCard.vue';
import debounce from 'docc-render/utils/debounce';
import { safeHighlightPattern } from 'docc-render/utils/search-utils';

export default {
  name: 'Navigator',
  components: { NavigatorCard },
  props: {
    parentTopicIdentifiers: {
      type: Array,
      required: true,
    },
    showExtraInfo: {
      type: Boolean,
      default: false,
    },
    technology: {
      type: Object,
      required: true,
    },
  },
  inject: ['references'],
  data() {
    return {
      filter: '',
    };
  },
  computed: {
    // filters the children based on the filter input
    filteredTree({ technology, filter }) {
      if (!filter.length) {
        return technology.children;
      }
      return technology.children.reduce(this.getNodes, []);
    },
    // gets the paths for each parent in the breadcrumbs
    parentTopicReferences({ references, parentTopicIdentifiers }) {
      return parentTopicIdentifiers.map(identifier => references[identifier].url);
    },
    // splits out the top-level technology crumb
    activePath({ parentTopicReferences, $route }) {
      return parentTopicReferences.slice(1).concat($route.path);
    },
    filterPattern: ({ filter }) => (!filter ? undefined : safeHighlightPattern(filter)),
  },
  methods: {
    getNodes(result, object) {
      if (this.filterPattern.test(object.title)) {
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
