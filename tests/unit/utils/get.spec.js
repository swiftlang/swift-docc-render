/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import get from 'docc-render/utils/get';

const testObject = {
  level1: 'level1',
  nested: {
    level2: 'level2',
    array_l2: ['a', 'b', 'c'],
    array_object: [{ inArray: 'inArray' }],
    nested_l2: {
      level3: 'level3',
    },
    emptyString: '',
    falseVal: false,
    nullVal: null,
    undefinedVal: undefined,
  },
};
describe('get', () => {
  it('fetches a deep property from an object', () => {
    expect(get(testObject, ['level1'])).toEqual('level1');
    expect(get(testObject, ['nested', 'level2'])).toEqual('level2');
  });

  it('fetches a deep property by key and index from mixed object', () => {
    expect(get(testObject, ['nested', 'array_l2', '1'])).toEqual('b');
    expect(get(testObject, ['nested', 'array_object', 0, 'inArray'])).toEqual('inArray');
  });

  it('uses the provided fallback', () => {
    expect(get(testObject, ['nested', 'none_existent'], 'foo')).toEqual('foo');
  });

  it('returns undefined if found nothing', () => {
    expect(get(testObject, ['nested', 'none_existent'])).toEqual(undefined);
  });

  it('returns falsy values', () => {
    expect(get(testObject, ['nested', 'emptyString'], 'fallback')).toBe('');
    expect(get(testObject, ['nested', 'falseVal'], 'fallback')).toBe(false);
    expect(get(testObject, ['nested', 'nullVal'], 'fallback')).toBe(null);
    expect(get(testObject, ['nested', 'undefinedVal'], 'fallback')).toBe('fallback');
  });
});
