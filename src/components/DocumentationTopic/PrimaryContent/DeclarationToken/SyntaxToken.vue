<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
// This component simply renders text with a span and a `token-[kind]` class.
export default {
  name: 'SyntaxToken',
  render(createElement) {
    return createElement('span', {
      class: `token-${this.kind}`,
    }, (
      this.text
    ));
  },
  props: {
    kind: {
      type: String,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
  },
};
</script>
