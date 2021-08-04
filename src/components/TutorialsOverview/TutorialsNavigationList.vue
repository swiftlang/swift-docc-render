<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <ol class="tutorials-navigation-list" role="list">
    <slot />
  </ol>
</template>

<script>
export default { name: 'TutorialsNavigationList' };
</script>

<style scoped lang="scss">
.tutorials-navigation-list {
  list-style-type: none;
  margin: 0;

  li + li:not(.volume--named) {
    margin-top: 24px;
  }

  .volume--named + .volume--named {
    margin-top: 12px;
  }
}
</style>
