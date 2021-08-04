/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export default {
  // inject both the `store` and the main `identifier`
  inject: ['identifier', 'store'],
  data: ({ store: { state } }) => ({
    state,
  }),
  computed: {
    // exposes the apiChanges for the current page
    apiChanges: ({ state: { apiChanges }, identifier }) => apiChanges && apiChanges[identifier],
  },
};
