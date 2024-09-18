/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import IndexStore from 'docc-render/stores/IndexStore';
import Language from 'docc-render/constants/Language';

export default {
  computed: {
    indexNodes({ indexState: { flatChildren }, interfaceLanguage }) {
      if (!flatChildren) return [];
      return flatChildren[interfaceLanguage] ?? (flatChildren[Language.swift.key.url] || []);
    },
  },
  data() {
    return {
      indexState: IndexStore.state,
    };
  },
};
