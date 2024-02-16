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

<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2024 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<template>
  <div class="pager">
    <div
      v-for="(page, n) in pages"
      :key="n"
      :class="['page', { active: isActivePage(n) }]"
    >
      <slot name="page" :page="page" />
    </div>
    <div class="indicators">
      <button
        v-for="(_, n) in pages"
        :key="n"
        :class="['indicator', { active: isActivePage(n) }]"
        @click="setActivePage(n)"
      />
    </div>
  </div>
</template>

<style scoped lang="scss">
.page {
  display: none;

  &.active {
    display: block;
  }
}

.indicators {
  display: flex;
  gap: 20px;
  justify-content: center;
  margin-top: 1rem;
}

.indicator {
  border-radius: 50%;
  display: block;
  height: 1em;
  outline: 1px solid currentColor;
  width: 1em;

  &.active {
    background: currentColor;
  }
}
</style>
