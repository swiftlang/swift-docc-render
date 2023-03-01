<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="view-more-link">
    <router-link
      :to="url"
      class="base-link"
    >
      View more
    </router-link>
  </div>
</template>

<script>
export default {
  name: 'ViewMore',
  props: {
    url: {
      type: String,
      required: true,
    },
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.view-more-link {
  display: flex;
  flex-flow: row-reverse;
  margin-bottom: 20px;
}

</style>
