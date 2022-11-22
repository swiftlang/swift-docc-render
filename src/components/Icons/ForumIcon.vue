<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="forum-icon"
    viewBox="0 0 14 14"
    themeId="forum"
  >
    <path d="M13 1v9h-7l-1.5 3-1.5-3h-2v-9zM12 2h-10v7h1.616l0.884 1.763 0.88-1.763h6.62z"></path>
    <path d="M3 4h8.001v1h-8.001v-1z"></path>
    <path d="M3 6h8.001v1h-8.001v-1z"></path>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'ForumIcon',
  components: { SVGIcon },
};
</script>
