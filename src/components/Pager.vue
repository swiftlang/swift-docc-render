<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<script setup>
import { ref } from 'vue';
import ChevronIcon from 'theme/components/Icons/ChevronIcon.vue';

defineProps({
  pages: {
    type: Array,
    required: true,
    validator: value => value.length > 0,
  },
});

const activePageIndex = ref(0);

function isActivePage(n) {
  return n === activePageIndex.value;
}

function setActivePage(n) {
  activePageIndex.value = n;
}

function pageStates(n) {
  return { active: isActivePage(n) };
}
</script>

<script>
/**
 * Provides a way of viewing one of many pages of content at a time.
 *
 * This component is similar to what is sometimes referred to as a "carousel"
 * of content. Users of this component specify an array of "pages" and can
 * specify how individual pages are presented through slots.
 *
 * ### Example
 *
 * As an example, this is how you could present a pager, which pages between
 * a few different paragraphs. Only one will be shown at a time, and there
 * will be controls to select which paragraph is currently showing.
 *
 * ```html
 * <Pager :pages="['a', 'b', 'c']">
 *   <template #page="{ page }">
 *     <p>{{ page }}</p>
 *   </template>
 * </Pager>
 * ```
 *
 * - Parameter pages: `Array` (**required**) - An non-empty array of any kind of
 *     content—each individual item will be provided as a prop to `page` slots.
 */
export default { name: 'Pager' };
</script>

<template>
  <div class="pager">
    <div class="container">
      <div class="gutter left">
        <button
          class="control"
          :disabled="activePageIndex < 1"
          @click="setActivePage(activePageIndex - 1)"
        >
          <ChevronIcon class="icon-retreat" />
        </button>
      </div>
      <div class="viewport">
        <div
          v-for="(page, n) in pages"
          :key="n"
          :class="['page', pageStates(n)]"
        >
          <slot name="page" :page="page" />
        </div>
      </div>
      <div class="gutter right">
        <button
          class="control"
          :disabled="activePageIndex >= (pages.length - 1)"
          @click="setActivePage(activePageIndex + 1)"
        >
          <ChevronIcon class="icon-advance" />
        </button>
      </div>
    </div>
    <div v-if="pages.length > 1" class="indicators">
      <button
        v-for="(_, n) in pages"
        :key="n"
        :class="['indicator', pageStates(n)]"
        @click="setActivePage(n)"
      />
    </div>
    <slot />
  </div>
</template>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.pager {
  --control-size: 3em;
  --control-color-fill: var(--color-fill-tertiary);
  --control-color-figure: currentColor;

  --indicator-size: 0.65em;
  --indicator-color-fill-active: currentColor;
  --indicator-color-fill-inactive: var(--color-fill-tertiary);

  --gutter-width: #{$large-viewport-dynamic-content-padding};

  position: relative;
}

.container {
  position: relative;
  width: 100%;
}

.viewport {
  overflow: hidden;
  position: relative;
  width: 100%;
}

.gutter {
  align-items: center;
  display: flex;
  justify-content: center;
  position: absolute;
  height: 100%;
  top: 0;
  width: var(--gutter-width);
  z-index: 42;

  @include breakpoint(small) {
    display: none;
  }

  &.left {
    left: calc(var(--gutter-width) * -1);
  }

  &.right {
    right: calc(var(--gutter-width) * -1);
  }
}

.control {
  align-items: center;
  background: var(--control-color-fill);
  border: 1px solid var(--control-color-fill);
  border-radius: 50%;
  display: flex;
  height: var(--control-size);
  justify-content: center;
  width: var(--control-size);

  &[disabled] {
    display: none;
  }

  .icon-advance,
  .icon-retreat {
    height: 65%;
    width: 65%;
  }

  .icon-advance {
    transform: scale(1, 1);
  }

  .icon-retreat {
    transform: scale(-1, 1);
  }
}

.page {
  float: left;
  margin-right: -100%;
  opacity: 0;
  position: relative;
  transition: all 0.5s ease-in-out;
  transform: translateX(-100%);
  width: 100%;

  @media (prefers-reduced-motion) {
    transition: none;
  }

  .active ~ & {
    transform: translateX(100%);
  }

  &.active {
    opacity: 1;
    transform: translateX(0%);
  }
}

.indicators {
  display: flex;
  flex-wrap: wrap;
  gap: 1em;
  justify-content: center;
  margin-top: 1rem;
}

.indicator {
  background: var(--indicator-color-fill-inactive);
  border: 1px solid var(--indicator-color-fill-inactive);
  border-radius: 50%;
  display: block;
  flex: 0 0 auto;
  height: var(--indicator-size);
  width: var(--indicator-size);

  &.active {
    background: var(--indicator-color-fill-active);
    border-color: var(--indicator-color-fill-active);
  }
}
</style>
