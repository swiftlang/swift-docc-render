/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import SymbolKind from 'docc-render/constants/SymbolKind';

// Returns whether or not the given symbol kind can be considered a potential
// "parent" of other symbols.
//
// Classes, enums, protocols, and structs can be thought of as parent symbols
// that may contain child symbol members for any of its
// properties/functions/initializers/etc for example.
//
// eslint-disable-next-line import/prefer-default-export
export function isParentSymbolKind(kind) {
  switch (kind) {
  case SymbolKind.class:
  case SymbolKind.enum:
  case SymbolKind.protocol:
  case SymbolKind.struct:
  case SymbolKind.uid:
    return true;
  default:
    return false;
  }
}
