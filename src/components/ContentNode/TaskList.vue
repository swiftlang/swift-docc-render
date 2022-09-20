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
      <input type="checkbox" disabled :checked="task.checked" />
      <slot name="task" :task="task" />
    </li>
  </ul>
</template>

<script>
const CHECKED_PROP = 'checked';

export default {
  name: 'TaskList',
  props: {
    tasks: {
      required: true,
      type: Array,
      // A task list is an unordered list that has at least one item with a
      // boolean `checked` property
      validator: list => list.some(item => (
        Object.hasOwnProperty.call(item, CHECKED_PROP)
      )),
    },
  },
};
</script>

<style scoped>
.tasklist {
  list-style-type: none;
  margin-left: 1rem;
}

input[type="checkbox"] + p {
  display: inline-block;
  margin-left: 0.5rem;
}
</style>
