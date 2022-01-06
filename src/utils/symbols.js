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
