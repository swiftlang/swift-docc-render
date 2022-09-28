<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon
    class="tutorial-icon"
    viewBox="0 0 14 14"
    themeId="tutorial"
  >
    <path d="M0.933 6.067h3.733v1.867h-3.733v-1.867z"></path>
    <path d="M0.933 1.867h3.733v1.867h-3.733v-1.867z"></path>
    <path d="M13.067 1.867v10.267h-7.467v-10.267zM12.133 2.8h-5.6v8.4h5.6z"></path>
    <path d="M0.933 10.267h3.733v1.867h-3.733v-1.867z"></path>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'TutorialIcon',
  components: { SVGIcon },
};
</script>
