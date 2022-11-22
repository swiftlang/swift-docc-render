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
    title: 'Topics',
    anchor: 'topics',
    level: 2,
  },
  defaultImplementations: {
    title: 'Default Implementations',
    anchor: 'default-implementations',
    level: 2,
  },
  relationships: {
    title: 'Relationships',
    anchor: 'relationships',
    level: 2,
  },
  seeAlso: {
    title: 'See Also',
    anchor: 'see-also',
    level: 2,
  },
};

export const PrimaryContentSectionAnchors = {
  [SectionKind.declarations]: {
    title: 'Declaration',
    anchor: 'declaration',
    level: 2,
  },
  [SectionKind.details]: {
    title: 'Details',
    anchor: 'details',
    level: 2,
  },
  [SectionKind.parameters]: {
    title: 'Parameters',
    anchor: 'parameters',
    level: 2,
  },
  [SectionKind.possibleValues]: {
    title: 'Possible Values',
    anchor: 'possibleValues',
    level: 2,
  },
};
