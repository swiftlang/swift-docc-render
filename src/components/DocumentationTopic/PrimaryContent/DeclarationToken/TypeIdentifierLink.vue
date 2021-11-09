<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
// This component renders token text as a link to a given type.
import Reference from 'docc-render/components/ContentNode/Reference.vue';

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
    // internal and external link
    if (reference && reference.url) {
      return createElement(Reference, {
        class: klass,
        props: {
          url: reference.url,
          kind: reference.kind,
          role: reference.role,
        },
      }, (
        this.$slots.default
      ));
    }
    // unresolved link, use span tag
    return createElement('span', {
      class: klass,
    }, (
      this.$slots.default
    ));
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
