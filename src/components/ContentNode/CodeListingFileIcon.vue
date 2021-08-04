<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SwiftFileIcon
    v-if="fileType === 'swift'"
    class="file-icon"
  />
  <GenericFileIcon
    v-else
    class="file-icon"
  />
</template>

<script>
import SwiftFileIcon from 'theme/components/Icons/SwiftFileIcon.vue';
import GenericFileIcon from 'theme/components/Icons/GenericFileIcon.vue';

export default {
  name: 'CodeListingFileIcon',
  components: {
    SwiftFileIcon,
    GenericFileIcon,
  },
  props: {
    fileType: String,
  },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.file-icon {
  position: relative;
  align-items: flex-end;
  height: 24px;
  margin: 0 .5rem 0 1rem;
}
</style>
