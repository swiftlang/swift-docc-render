<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div
    class="quick-navigation-bar"
    tabindex="0"
    @click="openQuickNavigationModal()"
    @keydown.enter.exact="openQuickNavigationModal"
  >
    <div class="quick-navigation-bar__container">
      <div>
        <div class="magnifier-icon">
          <MagnifierIcon />
        </div>
        <div class="placeholder">
          Quick Navigation
        </div>
      </div>
      <div>
        <kbd class="icon">
          <abbr
            class="open-modal-key"
            title="Forward slash"
          >
            /
          </abbr>
        </kbd>
      </div>
    </div>
  </div>
</template>

<script>
import MagnifierIcon from 'theme/components/Icons/MagnifierIcon.vue';

export default {
  name: 'QuickNavigationBar',
  components: {
    MagnifierIcon,
  },
  data() {
    return {
      quickNavigationStore: this.quickNavigationStore,
    };
  },
  inject: ['quickNavigationStore'],
  methods: {
    openQuickNavigationModal() {
      this.quickNavigationStore.toggleShowQuickNavigationModal(true);
    },
    onKeydown(event) {
      if (
        event.key === '/'
        || (event.key === 'o' && event.shiftKey && (event.metaKey || event.ctrlKey))
      ) {
        this.openQuickNavigationModal();
        event.preventDefault();
      }
    },
  },
  mounted() {
    window.addEventListener('keydown', this.onKeydown);
  },
  beforeDestroy() {
    window.removeEventListener('keydown', this.onKeydown);
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

$quick-navigation-icon-size: rem(20px);
.quick-navigation-bar {
  background: var(--background, var(--color-code-background));
  width: rem(250px);
  height: rem(33px);
  margin-right: rem(20px);
  border-radius: rem(5px);
  border: solid 1px var(--color-grid);
  display: flex;
  :hover {
    cursor: pointer;
  }
  @include nav-in-breakpoint() {
    display: none;
  }
  &__container {
    margin-top: auto;
    margin-bottom: auto;
    padding-left: rem(10px);
    padding-right: rem(7px);
    display: flex;
    width: 100%;
    justify-content: space-between;

    > div {
      display: flex;
      @include font-styles(documentation-nav);
    }
    .magnifier-icon {
      height: rem(15px);
      width: rem(15px);
      margin-right: 10px;
      margin-top: auto;
      margin-bottom: auto;
      > * {
        width: 100%;
      }
    }
    .placeholder {
      color: var(--color-nav-current-link)
    }
    .icon {
      border: solid 1px;
      border: solid 1px var(--color-grid);
      border-radius: $border-radius;
      color: var(--input-text);
      display: flex;
      margin: auto;
      height: $quick-navigation-icon-size;
      width: $quick-navigation-icon-size;
      .open-modal-key {
        @include font-styles(body-reduced-tight);
        text-decoration: none;
        margin: auto;
      }
    }
  }
}
</style>
