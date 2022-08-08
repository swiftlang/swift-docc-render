<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2022 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<template>
  <div class="StaticContentWidth">
    <slot />
  </div>
</template>

<script>
import throttle from 'docc-render/utils/throttle';

export default {
  name: 'StaticContentWidth',
  inject: ['store'],
  mounted() {
    const cb = throttle(async () => {
      await this.$nextTick();
      this.store.setContentWidth(this.$el.offsetWidth);
    }, 150);
    window.addEventListener('resize', cb);
    window.addEventListener('orientationchange', cb);
    this.$once('hook:beforeDestroy', () => {
      window.removeEventListener('resize', cb);
      window.removeEventListener('orientationchange', cb);
    });
    cb();
  },
};
</script>
