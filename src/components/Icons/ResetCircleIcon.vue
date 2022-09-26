<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="reset-circle-icon"
    viewBox="0 0 14 14"
    themeId="reset-circle"
  >
    <path d="M7 0.5c3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5c-3.59 0-6.5-2.91-6.5-6.5v0c0-3.59 2.91-6.5 6.5-6.5v0zM7 1.5c-3.038 0-5.5 2.462-5.5 5.5s2.462 5.5 5.5 5.5c3.038 0 5.5-2.462 5.5-5.5v0c0-3.038-2.462-5.5-5.5-5.5v0z"></path>
    <path d="M3.828 4.539l0.707-0.707 5.657 5.657-0.707 0.707-5.657-5.657z"></path>
    <path d="M3.828 9.489l5.657-5.657 0.707 0.707-5.657 5.657-0.707-0.707z"></path>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'ResetCircleIcon',
  components: { SVGIcon },
};
</script>
