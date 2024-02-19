<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<script setup>
import { ref } from 'vue';

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
    <div class="pages">
      <div
        v-for="(page, n) in pages"
        :key="n"
        :class="['page', pageStates(n)]"
      >
        <slot name="page" :page="page" />
      </div>
    </div>
    <div class="indicators">
      <button
        v-for="(_, n) in pages"
        :key="n"
        :class="['indicator', pageStates(n)]"
        @click="setActivePage(n)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.pager {
  position: relative;
}

.pages {
  overflow: hidden;
  position: relative;
  width: 100%;
}

.page {
  float: left;
  margin-right: -100%;
  opacity: 0;
  position: relative;
  transition: all 0.5s ease-in-out;
  transform: translateX(-100%);
  width: 100%;

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
  gap: 20px;
  justify-content: center;
  margin-top: 1rem;
}

.indicator {
  --indicator-size: 0.75em;

  border: 1px solid currentColor;
  border-radius: 50%;
  display: block;
  height: var(--indicator-size);
  width: var(--indicator-size);

  &.active {
    background: currentColor;
  }
}
</style>
