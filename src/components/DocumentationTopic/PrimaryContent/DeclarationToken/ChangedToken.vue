<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
import DeclarationToken from 'docc-render/components/DocumentationTopic/PrimaryContent/DeclarationToken.vue';

/**
 * Wraps a DeclarationToken in a `token-changed` span.
 * Used to color the added/removed tokens.
 */
export default {
  name: 'ChangedToken',
  render(createElement) {
    const {
      kind,
      tokens,
    } = this;
    return createElement(
      'span',
      { class: [`token-${kind}`, 'token-changed'] },
      tokens.map(token => createElement(DeclarationToken, { props: token })),
    );
  },
  props: {
    kind: {
      type: String,
      required: true,
    },
    tokens: {
      type: Array,
      required: true,
    },
  },
};
</script>
