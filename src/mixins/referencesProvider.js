/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import AppStore from 'docc-render/stores/AppStore';

export default {
  // inject the `store`
  inject: {
    store: {
      default: () => ({
        state: {
          references: {},
        },
        setReferences() {},
        reset() {},
      }),
    },
  },
  data: () => ({ appState: AppStore.state }),
  computed: {
    // exposes the references for the current page
    references: ({ store }) => store.state.references,
  },
};
