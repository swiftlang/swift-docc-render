<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
// This component renders token text as a link to a given type.
import { buildUrl } from 'docc-render/utils/url-helper';

export default {
  name: 'TypeIdentifierLink',
  inject: {
    references: {
      default() {
        return {};
      },
    },
  },
  render(createElement) {
    const klass = 'type-identifier-link';
    const reference = this.references[this.identifier];
    return reference && reference.url ? (
      // resolved reference, use anchor tag
      createElement('router-link', {
        class: klass,
        props: { to: buildUrl(reference.url, this.$route.query) },
      }, (
        this.$slots.default
      ))
    ) : (
      // unresolved link, use span tag
      createElement('span', {
        class: klass,
      }, (
        this.$slots.default
      ))
    );
  },
  props: {
    identifier: {
      type: String,
      required: true,
      default: () => '',
    },
  },
};
</script>
