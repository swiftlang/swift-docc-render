<template>
  <div class="navigator-card">
    <div class="head-wrapper" :class="{ 'extra-info': showExtendedInfo }">
      {{ technology }}
    </div>
    <div class="card-body">
      <NavigatorTree
        :children="childrenFiltered"
        :nesting-index="3"
        :active-path="activePath"
        :show-extended-info="showExtendedInfo"
        :filter-pattern="filterPattern"
      />
    </div>
  </div>
</template>

<script>
import NavigatorTree from 'docc-render/components/Navigator/NavigatorTree.vue';

export default {
  name: 'NavigatorCard',
  components: {
    NavigatorTree,
  },
  props: {
    technology: {
      type: String,
      required: true,
    },
    children: {
      type: Array,
      required: true,
    },
    activePath: {
      type: Array,
      required: true,
    },
    showExtendedInfo: {
      type: Boolean,
      default: false,
    },
    filterPattern: {
      type: RegExp,
      default: undefined,
    },
  },
  computed: {
    // TODO: move this to the backend
    childrenFiltered({ children }) {
      return children.filter(child => child.kind !== 'groupMarker');
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.navigator-card {
  overflow: hidden;

  .head-wrapper {
    padding: 10px;
    border-bottom: 1px solid var(--color-grid);
    display: flex;
    align-items: baseline;
  }
}

.card-link {
  color: var(--color-text);
  @include font-styles(body-reduced);
  font-weight: $font-weight-semibold;

  .extra-info & {
    @include font-styles(body-tight);
    font-weight: $font-weight-semibold;
  }
}
</style>
