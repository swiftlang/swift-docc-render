/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import emitWarningForSchemaVersionMismatch, {
  CURRENT_SUPPORTED_SCHEMA,
  combineVersions,
  CURRENT_SCHEMA_STRING, compareVersions,
} from 'docc-render/utils/schema-version-check';

const warnSpy = jest.spyOn(console, 'warn').mockReturnValue('');

describe('schema-version-check', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('does not emit a warning, if having an exact match', () => {
    emitWarningForSchemaVersionMismatch(CURRENT_SUPPORTED_SCHEMA);
    expect(warnSpy).toHaveBeenCalledTimes(0);
  });

  it('emits a warning if the major version is higher than the supported', () => {
    const newVersion = {
      ...CURRENT_SUPPORTED_SCHEMA,
      major: CURRENT_SUPPORTED_SCHEMA.major + 1,
    };
    emitWarningForSchemaVersionMismatch(newVersion);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy)
      .toHaveBeenCalledWith(`[Swift-DocC-Render] The render node version for this page (${combineVersions(newVersion)}) has a different major version component than Swift-DocC-Render supports (${CURRENT_SCHEMA_STRING}). Compatibility is not guaranteed.`);
  });

  it('emits a warning if the major version is lower than the supported', () => {
    const newVersion = {
      ...CURRENT_SUPPORTED_SCHEMA,
      major: CURRENT_SUPPORTED_SCHEMA.major - 1,
    };
    emitWarningForSchemaVersionMismatch(newVersion);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy)
      .toHaveBeenCalledWith(`[Swift-DocC-Render] The render node version for this page (${combineVersions(newVersion)}) has a different major version component than Swift-DocC-Render supports (${CURRENT_SCHEMA_STRING}). Compatibility is not guaranteed.`);
  });

  it('emits a warning if the minor version is higher than the supported', () => {
    const newVersion = {
      ...CURRENT_SUPPORTED_SCHEMA,
      minor: CURRENT_SUPPORTED_SCHEMA.minor + 1,
    };
    emitWarningForSchemaVersionMismatch(newVersion);
    expect(warnSpy).toHaveBeenCalledTimes(1);
    expect(warnSpy)
      .toHaveBeenCalledWith(`[Swift-DocC-Render] The render node version for this page has a higher minor version (${combineVersions(newVersion)}) than Swift-DocC-Render supports (${CURRENT_SCHEMA_STRING}). Compatibility is not guaranteed.`);
  });

  it('does not emit a warning, if the minor version is lower than the supported', () => {
    emitWarningForSchemaVersionMismatch({
      ...CURRENT_SUPPORTED_SCHEMA,
      minor: CURRENT_SUPPORTED_SCHEMA.minor - 1,
    });
    expect(warnSpy).toHaveBeenCalledTimes(0);
  });

  it('does not emit warnings for patch version mismatch', () => {
    emitWarningForSchemaVersionMismatch({
      ...CURRENT_SUPPORTED_SCHEMA,
      patch: CURRENT_SUPPORTED_SCHEMA.patch - 1,
    });
    expect(warnSpy).toHaveBeenCalledTimes(0);
  });

  it('does not do anything, if no version is provided', () => {
    emitWarningForSchemaVersionMismatch();
    expect(warnSpy).toHaveBeenCalledTimes(0);
  });

  describe('compareVersions', () => {
    it.each([
      ['1.1.1', '1.1.10', -1],
      ['1.1.1', '1.2.10', -1],
      ['1.1.20', '1.2.10', -1],
      ['1.1.1', '2.1.1', -1],
      ['1.1', '1.2.0', -1],
      ['1.1', '1.1.1', -1],

      ['1.1.10', '1.1.1', 1],
      ['1.1.10', '1.0.1', 1],
      ['1.1.10', '1.0.20', 1],
      ['2.1.0', '1.1.0', 1],
      ['1.2.0', '1.1', 1],
      ['1.2', '1.1', 1],

      ['1.1.1', '1.1.1', 0],
      ['1.1', '1.1', 0],
      ['1.1', '1.1.0', 0],
      ['1.1.0', '1.1', 0],
    ])('compares %s to %s and gets %s', (one, two, result) => {
      expect(compareVersions(one, two)).toBe(result);
    });
  });
});
