<template>
  <div class="OnThisPageStickyContainer" :class="{ hidden: isHidden }">
    <slot />
  </div>
</template>

<script>

export const ON_THIS_PAGE_CONTENT_BREAKPOINT = 1270;
export default {
  name: 'OnThisPageStickyContainer',
  inject: ['store'],
  computed: {
    isHidden: ({ store }) => store.state.contentWidth < ON_THIS_PAGE_CONTENT_BREAKPOINT,
  },
};
</script>

<style scoped lang='scss'>
@import 'docc-render/styles/_core.scss';

.OnThisPageStickyContainer {
  $sticky-aside-width: 170px;
  margin-top: $contenttable-spacing-single-side;
  position: sticky;
  top: $nav-height;
  align-self: flex-start;
  flex: 0 0 auto;
  box-sizing: border-box;
  width: $sticky-aside-width;
  margin-left: -$sticky-aside-width;
  padding-right: $nav-padding;

  @include breakpoint(small) {
    display: none;
  }

  &.hidden {
    display: none;
  }

  // if there is a sidebar, and its hidden, OR when we dont have a sidebar at all
  .full-width-container.sidebar-hidden &, .static-width-container {
    // 1080 content + 2x170px(aside) == 1500px. Extra 15px on each side.
    // Anything below it wont fit the floating aside
    @media screen and (max-width: 1500px) {
      display: none;
    }
  }
}
</style>
