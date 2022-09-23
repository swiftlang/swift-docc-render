<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="timer-icon"
    viewBox="0 0 14 14"
    themeId="timer"
  >
    <path d="M7 0.5c3.59 0 6.5 2.91 6.5 6.5s-2.91 6.5-6.5 6.5c-3.59 0-6.5-2.91-6.5-6.5v0c0-3.59 2.91-6.5 6.5-6.5v0zM7 2c-2.761 0-5 2.239-5 5s2.239 5 5 5c2.761 0 5-2.239 5-5v0c0-2.761-2.239-5-5-5v0z"></path>
    <path d="M6.51 3.51h1.5v3.5h-1.5v-3.5z"></path>
    <path d="M6.51 7.010h4v1.5h-4v-1.5z"></path>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'TimerIcon',
  components: { SVGIcon },
};
</script>
