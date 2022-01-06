import { isParentSymbolKind } from 'docc-render/utils/symbols';
import SymbolKind from 'docc-render/constants/SymbolKind';

describe('isParentSymbolKind', () => {
  it('returns true for kind "class"', () => {
    expect(isParentSymbolKind(SymbolKind.class)).toBe(true);
  });

  it('returns true for kind "enum"', () => {
    expect(isParentSymbolKind(SymbolKind.enum)).toBe(true);
  });

  it('returns true for kind "protocol"', () => {
    expect(isParentSymbolKind(SymbolKind.protocol)).toBe(true);
  });

  it('returns true for kind "struct"', () => {
    expect(isParentSymbolKind(SymbolKind.struct)).toBe(true);
  });

  it('returns true for kind "uid"', () => {
    expect(isParentSymbolKind(SymbolKind.uid)).toBe(true);
  });

  it('returns false for other kind values', () => {
    expect(isParentSymbolKind(SymbolKind.unknown)).toBe(false);
    expect(isParentSymbolKind('clm')).toBe(false);
    expect(isParentSymbolKind('instm')).toBe(false);
    expect(isParentSymbolKind('method')).toBe(false);
    expect(isParentSymbolKind('initializer')).toBe(false);
    expect(isParentSymbolKind('func')).toBe(false);
    expect(isParentSymbolKind('function')).toBe(false);
    expect(isParentSymbolKind('property')).toBe(false);
    expect(isParentSymbolKind('')).toBe(false);
  });
});
