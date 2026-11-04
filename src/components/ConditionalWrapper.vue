<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<script>
import { h } from 'vue';

/**
 * Conditionally renders a component around the default slot.
 */
export default {
  name: 'ConditionalWrapper',
  inheritAttrs: false,
  props: {
    tag: [Object, String],
    shouldWrap: Boolean,
  },
  render() {
    const children = this.$slots.default ? this.$slots.default() : [];
    if (this.shouldWrap) {
      return h(
        this.tag,
        this.$attrs,
        typeof this.tag === 'string' ? children : { default: () => children },
      );
    }
    return children;
  },
};
</script>
