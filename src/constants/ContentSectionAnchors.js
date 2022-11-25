/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { SectionKind } from 'docc-render/constants/PrimaryContentSection';

export const MainContentSectionAnchors = {
  topics: {
    title: this.$t('sections.topics'),
    anchor: 'topics',
    level: 2,
  },
  defaultImplementations: {
    title: this.$t('sections.default-implementations'),
    anchor: 'default-implementations',
    level: 2,
  },
  relationships: {
    title: this.$t('sections.relationships'),
    anchor: 'relationships',
    level: 2,
  },
  seeAlso: {
    title: this.$t('sections.see-also'),
    anchor: 'see-also',
    level: 2,
  },
};

export const PrimaryContentSectionAnchors = {
  [SectionKind.declarations]: {
    title: this.$t('section.declarations'),
    anchor: 'declaration',
    level: 2,
  },
  [SectionKind.details]: {
    title: this.$t('section.details'),
    anchor: 'details',
    level: 2,
  },
  [SectionKind.parameters]: {
    title: this.$t('section.parameters'),
    anchor: 'parameters',
    level: 2,
  },
  [SectionKind.possibleValues]: {
    title: this.$t('section.possible-values'),
    anchor: 'possibleValues',
    level: 2,
  },
};
