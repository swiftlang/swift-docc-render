/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

// eslint-disable-next-line import/prefer-default-export
export function shouldInactivateRef(identifier, context = {}) {
  const { includedArchiveIdentifiers = [] } = context;
  return !!(includedArchiveIdentifiers.length && (
    !includedArchiveIdentifiers.some(id => (
      identifier?.startsWith(`doc://${id}`)
    ))
  ));
}
