<template>
  <div class="navigator-card">
    <div class="head-wrapper" :class="{ 'extra-info': showExtendedInfo }">
      <NavigatorLeafIcon :type="kind" />
      <span class="card-link">
        {{ technology }}
      </span>
    </div>
    <div class="card-body">
      <NavigatorTree
        :children="childrenFiltered"
        :nesting-index="2"
        :active-path="activePath"
        :show-extended-info="showExtendedInfo"
        :filter-pattern="filterPattern"
      />
    </div>
  </div>
</template>

<script>
import NavigatorTree from 'docc-render/components/Navigator/NavigatorTree.vue';
import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';

export default {
  name: 'NavigatorCard',
  components: {
    NavigatorLeafIcon,
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
    kind: {
      type: String,
      required: true,
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
    padding: 10px 20px;
    border-bottom: 1px solid var(--color-grid);
    display: flex;
    align-items: center;
  }
}

.card-body {
  padding: 10px 20px;
}

.card-link {
  color: var(--color-text);
  @include font-styles(body-tight);
  font-weight: $font-weight-semibold;
}
</style>
