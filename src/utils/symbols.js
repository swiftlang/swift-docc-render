import SymbolKind from 'docc-render/constants/SymbolKind';

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
