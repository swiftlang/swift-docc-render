<template>
  <div class="documentation-hero" :style="styles">
    <NavigatorLeafIcon :kind="kind" key="first" class="background-icon first-icon" with-colors />
    <NavigatorLeafIcon :kind="kind" key="second" class="background-icon second-icon" with-colors />
    <div class="documentation-hero__content">
      <slot />
    </div>
  </div>
</template>

<script>

import NavigatorLeafIcon from 'docc-render/components/Navigator/NavigatorLeafIcon.vue';
import { TopicKindColorsMap, TopicKindAliases, TopicKindColors } from 'docc-render/constants/kinds';

export default {
  name: 'DocumentationHero',
  components: { NavigatorLeafIcon },
  props: {
    kind: {
      type: String,
      required: true,
    },
  },
  computed: {
    // get the alias, if any, and fallback to the `teal` color
    color: ({ kind }) => TopicKindColorsMap[TopicKindAliases[kind] || kind] || TopicKindColors.teal,
    styles: ({ color }) => ({
      // use the color or fallback to the gray secondary, if not defined.
      '--accent-color': `var(--color-kind-icon-${color}, var(--color-figure-gray-secondary))`,
    }),
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.documentation-hero {
  background: dark-color(fill);
  color: light-color(fill);
  overflow: hidden;
  text-align: center;
  padding-bottom: 20px;
  position: relative;

  // gradient
  &:before {
    content: '';
    background: radial-gradient(circle at top, var(--accent-color) 10%, transparent 100%);
    position: absolute;
    width: 100%;
    left: 0;
    top: -50%;
    height: 150%;
    right: 0;
  }

  // black overlay
  &:after {
    background: dark-color(fill);
    opacity: 40%;
    width: 100%;
    position: absolute;
    content: '';
    height: 100%;
    left: 0;
    top: 0;
  }

  .background-icon {
    position: absolute;
    display: block;
    width: 250px;
    height: 250px;
    opacity: 35%;

    /deep/ svg {
      width: 100%;
      height: 100%;
    }

    &.first-icon {
      left: 0;
      top: 100%;
      transform: translateY(-50%);
      @include breakpoint(small) {
        left: -15%;
        top: 80%;
      }
    }

    &.second-icon {
      right: 0;
      top: -10%;
      transform: translateY(-50%);
      @include breakpoint(small) {
        display: none;
      }
    }
  }

  &__content {
    position: relative;
    z-index: 1;
    @include breakpoint-dynamic-sidebar-content;
  }
}
</style>
