<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ul class="tasklist">
    <li v-for="(task, i) in tasks" :key="i">
      <input v-if="showCheckbox(task)" type="checkbox" disabled :checked="task.checked" />
      <slot name="task" :task="task" />
    </li>
  </ul>
</template>

<script>
const CHECKED_PROP = 'checked';

const hasCheckedProp = obj => Object.hasOwnProperty.call(obj, CHECKED_PROP);

export default {
  name: 'TaskList',
  props: {
    tasks: {
      required: true,
      type: Array,
      // A task list is an unordered list that has at least one item with a
      // boolean `checked` property
      validator: list => list.some(hasCheckedProp),
    },
  },
  methods: {
    showCheckbox: hasCheckedProp,
  },
};
</script>

<style scoped lang="scss">
.tasklist {
  --checkbox-width: 1rem;
  --indent-width: calc(var(--checkbox-width) / 2);
  --content-margin: var(--indent-width);

  list-style-type: none;
  margin-left: var(--indent-width);
}

p {
  margin-left: var(--content-margin);

  &:only-child {
    --content-margin: calc(var(--checkbox-width) + var(--indent-width));
  }

  input[type="checkbox"] + & {
    display: inline-block;
  }
}
</style>
