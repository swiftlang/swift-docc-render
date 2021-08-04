<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div :style="backgroundStyle">
    <slot />
  </div>
</template>

<script>
import CodeThemeStore from 'docc-render/stores/CodeThemeStore';

export default {
  name: 'BackgroundTheme',
  data() {
    return {
      codeThemeState: CodeThemeStore.state,
    };
  },
  computed: {
    backgroundStyle() {
      const { codeColors } = this.codeThemeState;

      if (!codeColors) {
        return null;
      }

      return {
        '--background': codeColors.background,
      };
    },
  },
};

</script>
