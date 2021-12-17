<template>
  <div class="navigator">
    <NavigatorCard
      :technology="technology.title"
      :kind="technology.kind"
      :children="filteredTree"
      :active-path="activePath"
      :show-extended-info="showExtraInfo"
      :filter-pattern="filterPattern"
    />
    <div class="navigator-filter">
      <div class="input-wrapper">
        <FilterIcon class="icon-inline filter-icon" />
        <input
          type="text"
          :value="filter"
          :placeholder="`Filter in ${technology.title}`"
          @input="debounceInput">
      </div>
    </div>
  </div>
</template>

<script>
import NavigatorCard from 'docc-render/components/Navigator/NavigatorCard.vue';
import debounce from 'docc-render/utils/debounce';
import { safeHighlightPattern } from 'docc-render/utils/search-utils';
import FilterIcon from 'docc-render/components/Icons/FilterIcon.vue';

export default {
  name: 'Navigator',
  components: { FilterIcon, NavigatorCard },
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

.navigator-filter {
  position: sticky;
  bottom: 0;
  z-index: 1;
  padding: 8px 20px;
  background: var(--color-fill-secondary);
  border-top: 1px solid var(--color-grid);

  .input-wrapper {
    position: relative;
  }

  .filter-icon {
    width: 1em;
    position: absolute;
    left: 0;
    top: 50%;
    transform: translate(50%, -50%);
    color: var(--color-link);
  }

  input {
    border: 1px solid var(--color-grid);
    padding: 10px;
    width: 100%;
    box-sizing: border-box;
    border-radius: $border-radius;
    padding-left: 35px;

    &:focus {
      outline: none;
      @include focus-shadow-form-element();
    }
  }
}
</style>
