<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2023 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->
<script>
/**
 * Conditionally renders a component around the default slot.
 */
export default {
  functional: true,
  name: 'ConditionalWrapper',
  props: {
    tag: [Object, String],
    shouldWrap: Boolean,
  },
  render(h, context) {
    if (context.props.shouldWrap) {
      return h(context.props.tag, context.data, context.children);
    }
    return context.children;
  },
};
</script>
