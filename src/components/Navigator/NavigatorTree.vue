<template>
  <ul class="navigator-tree">
    <NavigatorTreeLeaf
      v-for="item in children"
      :key="item.uid"
      :item="item"
      :expanded-items="expanded"
      :nesting-index="nestingIndex"
      :active-path="activePath"
      :show-extended-info="showExtendedInfo"
      :filter-pattern="filterPattern"
      @toggle="handleToggle"
      @scroll-to="$emit('scroll-to', $event)"
    />
  </ul>
</template>

<script>
import NavigatorTreeLeaf from 'docc-render/components/Navigator/NavigatorTreeLeaf.vue';

export default {
  name: 'NavigatorTree',
  components: { NavigatorTreeLeaf },
  props: {
    children: {
      type: Array,
      required: true,
    },
    nestingIndex: {
      type: Number,
      default: 1,
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
  data() {
    return {
      expanded: [],
    };
  },
  mounted() {
    const activeChildren = this.children
      .filter(child => this.activePath[0] === child.path || child.expanded)
      .map(({ uid }) => uid);

    if (activeChildren.length) {
      this.expanded = activeChildren;
    }
  },
  watch: {
    children() {
      this.expanded = this.children.filter(child => child.expanded).map(({ uid }) => uid);
    },
  },
  methods: {
    handleToggle(uid) {
      const index = this.expanded.indexOf(uid);
      if (index === -1) {
        this.expanded.push(uid);
      } else {
        this.expanded.splice(index, 1);
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.navigator-tree {
  list-style: none;
  margin: 0;
}
</style>
