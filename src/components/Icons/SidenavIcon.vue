<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <SVGIcon viewBox="0 0 14 14" height="14" class="sidenav-icon" themeId="sidenav">
    <path d="M6.533 1.867h-6.533v10.267h14v-10.267zM0.933 11.2v-8.4h4.667v8.4zM13.067 11.2h-6.533v-8.4h6.533z"></path>
    <path d="M1.867 5.133h2.8v0.933h-2.8z"></path>
    <path d="M1.867 7.933h2.8v0.933h-2.8z"></path>
  </SVGIcon>
</template>

<script>
import SVGIcon from 'docc-render/components/SVGIcon.vue';

export default {
  name: 'SidenavIcon',
  components: { SVGIcon },
};
</script>
