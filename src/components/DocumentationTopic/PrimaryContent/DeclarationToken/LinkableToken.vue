<!--
  This source file is part of the Swift.org open source project

  Copyright (c) 2021 Apple Inc. and the Swift project authors
  Licensed under Apache License v2.0 with Runtime Library Exception

  See https://swift.org/LICENSE.txt for license information
  See https://swift.org/CONTRIBUTORS.txt for Swift project authors
-->

<script>
// This component renders token text as a link to a given type.
import { shouldInactivateRef } from 'docc-render/utils/references';
import AppStore from 'docc-render/stores/AppStore';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import referencesProvider from 'docc-render/mixins/referencesProvider';

export default {
  name: 'LinkableToken',
  mixins: [referencesProvider],
  data: () => ({
    appState: AppStore.state,
  }),
  render(createElement) {
    const reference = this.references[this.identifier];

    const { includedArchiveIdentifiers } = this;
    const isInactive = shouldInactivateRef(this.identifier, { includedArchiveIdentifiers });

    // internal and external link
    if (reference && reference.url && !isInactive) {
      return createElement(Reference, {
        props: {
          url: reference.url,
          kind: reference.kind,
          role: reference.role,
        },
      }, (
        this.$slots.default
      ));
    }
    // unresolved/inactive link, use span tag
    return createElement('span', {}, (
      this.$slots.default
    ));
  },
  computed: {
    includedArchiveIdentifiers: ({ appState }) => appState.includedArchiveIdentifiers,
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
