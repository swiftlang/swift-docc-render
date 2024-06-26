/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { shouldInactivateRef } from 'docc-render/utils/references';

const refId = 'doc://Foo/documentation/foo/bar';
const archiveIds = {
  Foo: 'Foo',
  Bar: 'Bar',
  Qux: 'Qux',
};

describe('shouldInactivateRef', () => {
  it('returns false with no context', () => {
    expect(shouldInactivateRef(refId)).toBe(false);
    expect(shouldInactivateRef(refId, {})).toBe(false);
  });

  it('returns false when `includedArchiveIdentifiers` context is empty', () => {
    expect(shouldInactivateRef(refId, { includedArchiveIdentifiers: [] })).toBe(false);
  });

  it('returns false when non-empy `includedArchiveIdentifiers` context includes id', () => {
    expect(shouldInactivateRef(refId, {
      includedArchiveIdentifiers: [archiveIds.Foo],
    })).toBe(false);
    expect(shouldInactivateRef(refId, {
      includedArchiveIdentifiers: [
        archiveIds.Bar,
        archiveIds.Foo,
      ],
    })).toBe(false);
  });

  it('returns true when non-empty `includedArchiveIdentifiers` context does not include id', () => {
    expect(shouldInactivateRef(refId, {
      includedArchiveIdentifiers: [archiveIds.Bar],
    })).toBe(true);
    expect(shouldInactivateRef(refId, {
      includedArchiveIdentifiers: [
        archiveIds.Bar,
        archiveIds.Qux,
      ],
    })).toBe(true);
  });
});
