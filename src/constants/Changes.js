/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export const ChangeTypes = {
  added: 'added',
  modified: 'modified',
  deprecated: 'deprecated',
};

export const ChangeTypesOrder = [ChangeTypes.modified, ChangeTypes.added, ChangeTypes.deprecated];

export const ChangeNames = {
  [ChangeTypes.modified]: 'change-type.modified',
  [ChangeTypes.added]: 'change-type.added',
  [ChangeTypes.deprecated]: 'change-type.deprecated',
};

export const ChangeNameToType = {
  'change-type.modified': ChangeTypes.modified,
  'change-type.added': ChangeTypes.added,
  'change-type.deprecated': ChangeTypes.deprecated,
};
