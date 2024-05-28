<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
// This component is an optimization that allows us to emit raw text DOM nodes
// for simple text tokens that have no need for a wrapper element. This uses a
// private Vue API (`this._v`) and falls back to adding an empty <span> tag if
// that API goes away in the future.
export default {
  name: 'RawText',
  render(createElement) {
    const {
      _v: createTextNode = str => createElement('span', str),
      text,
    } = this;
    return createTextNode(text);
  },
  props: {
    text: {
      type: String,
      required: true,
    },
  },
};
</script>
