/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { tokenize } from 'docc-render/utils/json-pointer';

describe('tokenize', () => {
  it('returns an empty token array for an empty string pointer', () => {
    expect([...tokenize('')]).toEqual([]);
  });

  it('returns an array of one token for top level JSON pointers', () => {
    expect([...tokenize('/foo')]).toEqual(['foo']);
    expect([...tokenize('/')]).toEqual(['']);
    expect([...tokenize('/a~1b')]).toEqual(['a/b']);
    expect([...tokenize('/c%d')]).toEqual(['c%d']);
    expect([...tokenize('/e^f')]).toEqual(['e^f']);
    expect([...tokenize('/g|h')]).toEqual(['g|h']);
    expect([...tokenize('/i\\j')]).toEqual(['i\\j']);
    expect([...tokenize('/k"l')]).toEqual(['k"l']);
    expect([...tokenize('/ ')]).toEqual([' ']);
    expect([...tokenize('/m~0n')]).toEqual(['m~n']);
  });

  it('returns an array of tokens when the pointer contains an index', () => {
    expect([...tokenize('/foo/0')]).toEqual(['foo', '0']);
    expect([...tokenize('/foo/1')]).toEqual(['foo', '1']);
  });
});
