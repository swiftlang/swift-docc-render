<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon class="document-icon" viewBox="0 0 14 14" themeId="document">
    <path d="M11.2,5.3,8,2l-.1-.1H2.8V12.1h8.5V6.3l-.1-1ZM8,3.2l2,2.1H8Zm2.4,8H3.6V2.8H7V6.3h3.4Z"/>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'DocumentIcon',
  components: { SVGIcon },
};
</script>

<style scoped lang="scss">
@import 'docc-render/styles/_core.scss';

.document-icon {
  margin-left: -3px;
}

</style>
