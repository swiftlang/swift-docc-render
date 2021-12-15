<template>
  <div class="navigator-card" :class="{ open: isOpen, highlighted: isCurrentPage }">
    <div class="head-wrapper">
      <button class="directory-toggle" @click.prevent="toggleCard">
        <InlineChevronRightIcon class="icon-inline chevron" />
      </button>
      <router-link
        :to="technology.path"
        class="card-link"
      >
        {{ technology.title }}
      </router-link>
    </div>
    <div class="card-body">
      <TransitionExpand>
        <NavigatorTree
          v-if="isOpen"
          :children="childrenFiltered"
          :nesting-index="3"
          :active-path="activePathMinusFirst"
        />
      </TransitionExpand>
    </div>
  </div>
</template>

<script>
import InlineChevronRightIcon from 'docc-render/components/Icons/InlineChevronRightIcon.vue';
import TransitionExpand from 'docc-render/components/TransitionExpand.vue';
import NavigatorTree from 'docc-render/components/Navigator/NavigatorTree.vue';

export default {
  name: 'NavigatorCard',
  components: { NavigatorTree, TransitionExpand, InlineChevronRightIcon },
  props: {
    technology: {
      type: Object,
      required: true,
    },
    activePath: {
      type: Array,
      required: true,
    },
  },
  data() {
    return {
      isOpen: this.activePath[0] === this.technology.path,
    };
  },
  computed: {
    activePathMinusFirst: ({ activePath }) => activePath.slice(1),
    // TODO: move this to the backend
    childrenFiltered({ technology }) {
      return technology.children.filter(child => child.kind !== 'groupMarker');
    },
    isCurrentPage({ activePath, technology }) {
      return activePath.length === 1 && activePath[0] === technology.path;
    },
  },
  methods: {
    toggleCard() {
      this.isOpen = !this.isOpen;
      if (this.isOpen) {
        this.$emit('open', this.technology.path);
      }
    },
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.navigator-card {
  border: 1px solid transparent;
  border-radius: $big-border-radius;
  overflow: hidden;

  .head-wrapper {
    padding: 10px;
    border-bottom: 1px solid var(--color-grid);
    display: flex;
    align-items: center;
    position: relative;
  }

  .directory-toggle {
    padding-right: 5px;
    height: 15px;
    display: flex;
    align-items: center;
    justify-content: center;
    position: relative;
    z-index: 1;
  }

  &:hover:not(.open) {
    background: var(--color-fill-light-blue);

    .head-wrapper {
      border-bottom-color: transparent;
    }
  }

  &.highlighted {
    border-color: var(--color-grid);

    .head-wrapper {
      background: var(--color-fill-gray-quaternary);
    }

    &:not(.open) {
      .head-wrapper {
        border-bottom-color: transparent;
      }
    }
  }

  &.open {
    border-color: var(--color-grid);

    .card-body {
      background: var(--color-fill-secondary);
    }
  }
}

.card-link {
  color: var(--color-text);
  @include font-styles(body-reduced);
  font-weight: $font-weight-semibold;

  &:after {
    content: '';
    position: absolute;
    top: 0;
    left: 0;
    right: 0;
    bottom: 0;
  }
}

.chevron {
  width: 10px;
  height: 10px;
  transition: transform 0.15s ease-in;
  color: var(--color-link);

  .open & {
    transform: rotate(90deg);
  }
}
</style>
