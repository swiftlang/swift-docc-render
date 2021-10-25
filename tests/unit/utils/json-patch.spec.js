/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { apply } from 'docc-render/utils/json-patch';

describe('apply', () => {
  it('returns an unchanged document with an empty patch', () => {
    expect(apply({}, [])).toEqual({});
    expect(apply([], [])).toEqual([]);
    expect(apply({
      foo: 'foo',
      bar: 'bar',
    }, [])).toEqual({
      bar: 'bar',
      foo: 'foo',
    });
  });

  it('throws an error for an operation with an unknown "op" value', () => {
    expect(() => apply({}, [{ op: 'fake' }])).toThrowError('unknown operation');
  });

  it('adds an object member', () => {
    expect(apply({
      foo: 'bar',
    }, [
      { op: 'add', path: '/baz', value: 'qux' },
    ])).toEqual({
      foo: 'bar',
      baz: 'qux',
    });
  });

  it('adds an array element', () => {
    expect(apply({
      foo: ['bar', 'baz'],
    }, [
      { op: 'add', path: '/foo/1', value: 'qux' },
    ])).toEqual({
      foo: ['bar', 'qux', 'baz'],
    });
  });

  it('removes an object member', () => {
    expect(apply({
      baz: 'qux',
      foo: 'bar',
    }, [
      { op: 'remove', path: '/baz' },
    ])).toEqual({
      foo: 'bar',
    });
  });

  it('removes an array element', () => {
    expect(apply({
      foo: ['bar', 'qux', 'baz'],
    }, [
      { op: 'remove', path: '/foo/1' },
    ])).toEqual({
      foo: ['bar', 'baz'],
    });
  });

  it('replaces a value', () => {
    expect(apply({
      baz: 'qux',
      foo: 'bar',
    }, [
      { op: 'replace', path: '/baz', value: 'boo' },
    ])).toEqual({
      baz: 'boo',
      foo: 'bar',
    });
  });

  it('moves a value', () => {
    expect(apply({
      foo: {
        bar: 'baz',
        waldo: 'fred',
      },
      qux: {
        corge: 'grault',
      },
    }, [
      { op: 'move', from: '/foo/waldo', path: '/qux/thud' },
    ])).toEqual({
      foo: {
        bar: 'baz',
      },
      qux: {
        corge: 'grault',
        thud: 'fred',
      },
    });
  });

  it('moves an array element', () => {
    expect(apply({
      foo: ['all', 'grass', 'cows', 'eat'],
    }, [
      { op: 'move', from: '/foo/1', path: '/foo/3' },
    ])).toEqual({
      foo: ['all', 'cows', 'eat', 'grass'],
    });
  });

  it('successfully tests a value', () => {
    expect(() => {
      apply({
        baz: 'qux',
        foo: ['a', 2, 'c'],
      }, [
        { op: 'test', path: '/baz', value: 'qux' },
        { op: 'test', path: '/foo/1', value: 2 },
      ]);
    }).not.toThrow();
  });

  it('unsuccessfully tests a value', () => {
    expect(() => {
      apply({
        baz: 'qux',
      }, [
        { op: 'test', path: '/baz', value: 'bar' },
      ]);
    }).toThrow();
  });

  it('adds a nested member object', () => {
    expect(apply({
      foo: 'bar',
    }, [
      { op: 'add', path: '/child', value: { grandchild: {} } },
    ])).toEqual({
      foo: 'bar',
      child: {
        grandchild: {},
      },
    });
  });

  it('ignores unrecognized elements', () => {
    expect(apply({
      foo: 'bar',
    }, [
      {
        op: 'add',
        path: '/baz',
        value: 'qux',
        xyz: 123,
      },
    ])).toEqual({
      foo: 'bar',
      baz: 'qux',
    });
  });

  it('fails when attempting to add to a nonexistent target', () => {
    expect(() => {
      apply({
        foo: 'bar',
      }, [
        { op: 'add', path: '/baz/bat', value: 'qux' },
      ]);
    }).toThrow();
  });

  it('handles escape ordering for ~ properly', () => {
    const document = JSON.parse(`
    {
      "/": 9,
      "~1": 10
    }`);
    const patch = [{ op: 'test', path: '/~01', value: 10 }];
    expect(() => apply(document, patch)).not.toThrow();
    expect(apply(document, patch)).toEqual({ ...document });
  });

  it('fails when attempting to compare strings and numbers', () => {
    const document = JSON.parse(`
    {
      "/": 9,
      "~1": 10
    }`);
    const patch = [{ op: 'test', path: '/~01', value: '10' }];
    expect(() => apply(document, patch)).toThrow();
  });

  it('adds an array value', () => {
    expect(apply({
      foo: ['bar'],
    }, [
      { op: 'add', path: '/foo/-', value: ['abc', 'def'] },
    ])).toEqual({
      foo: ['bar', ['abc', 'def']],
    });
  });

  it('returns an unchanged document when the patch results in no changes', () => {
    expect(apply({}, [
      { op: 'add', path: '/foo', value: 'bar' },
      { op: 'remove', path: '/foo' },
    ])).toEqual({});
  });

  it('handles `null` values properly', () => {
    expect(apply({
      foo: { bar: null },
    }, [
      { op: 'copy', from: '/foo/bar', path: '/baz' },
    ])).toEqual({
      foo: { bar: null },
      baz: null,
    });
  });
});
