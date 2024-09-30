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
    apiChanges({
      indexState: {
        apiChanges,
        apiChangesVersion,
        errorFetchingDiffs,
      },
      interfaceLanguage,
      selectedAPIChangesVersion,
    }) {
      if (!apiChanges || errorFetchingDiffs) return undefined;
      return apiChangesVersion === selectedAPIChangesVersion
        ? apiChanges[interfaceLanguage] : undefined;
    },
    technologyProps({ indexState: { technologyProps }, interfaceLanguage, technology }) {
      // Select technology props from fetched index data for the current language, fallback to swift
      // If none available, fallback to technology data of the curr page or null
      return technologyProps[interfaceLanguage] ?? technologyProps[Language.swift.key.url]
        ?? (technology ? {
          technology: technology.title,
          technologyPath: technology.path || technology.url,
          isTechnologyBeta: technology.beta,
        } : null);
    },
    navigatorProps: ({
      indexNodes,
      indexState: {
        flatChildren,
        references,
        errorFetching,
      },
      apiChanges,
    }) => ({
      flatChildren: indexNodes,
      navigatorReferences: references,
      apiChanges,
      isFetching: !flatChildren && !errorFetching,
      errorFetching,
    }),
  },
  data() {
    return {
      indexState: IndexStore.state,
    };
  },
};
