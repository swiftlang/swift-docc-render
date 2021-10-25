/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/* eslint-disable no-restricted-syntax */

import { tokenize } from 'docc-render/utils/json-pointer';

const DECIMAL_RADIX = 10;
const END_INDEX = '-';
const OBJECT = 'object';

// A generic error used to indicate that a given JSON pointer is considered
// invalid in the context of some JSON Patch operation.
class InvalidPointerError extends Error {
  constructor(pointer) {
    super(`invalid pointer ${pointer}`);
    this.pointer = pointer;
  }
}

// Parses a string representing a JSON pointer array index, which will either be
// an integer or the character "-", which is used to indicate that an operation
// will add to the end of an array.
//
// Examples:
//
// parseArrayIndex('42')           // 42
// parseArrayIndex('-')            // 0
// parseArrayIndex('-', [0, 1, 2]) // 3
// parseArrayIndex('two')          // Error: invalid array two
// parseArrayIndex('4', [0, 1, 2]) // Error: invalid array 4
function parseArrayIndex(token, { length }) {
  if (token === END_INDEX) {
    return length || 0;
  }

  const index = parseInt(token, DECIMAL_RADIX);
  if (!Number.isInteger(index) || index > length) {
    throw new Error(`invalid array index ${token}`);
  }

  return index;
}

// Given a document, this generates a sequence of object values corresponding to
// each reference token in a given JSON pointer. An object representing each
// individual token and its associated value is yielded.
//
// Examples:
//
// [...walk({ a: b: { c: 42 } }, '/a/b/c')]
// // [
// //   { token: 'a', node: { b: { c: { 42 } } } },
// //   { token: 'b', node: { c: 42 } },
// //   { token: 'c', node: 42 },
// // ]
//
// [...walk({ a: 42 }, '/z', { strict: true })]
// // Error: invalid pointer /z
function* walk(document, pointer, options = { strict: false }) {
  let node = document;

  for (const token of tokenize(pointer)) {
    // if the `strict` flag is used, first check that each token references an
    // existing property and throw an error if not
    if (options.strict && !Object.prototype.hasOwnProperty.call(node, token)) {
      throw new InvalidPointerError(pointer);
    }
    node = node[token];
    yield { node, token };
  }
}

// Retrieves the document value associated with a given JSON pointer.
//
// Examples:
//
// get({ a: { b: { c: 42 } } }, '/a/b/c') // 42
// get({ a: 42 }, '/z')                   // Error: invalid pointer /z
function get(document, pointer) {
  let value = document;

  for (const { node } of walk(document, pointer, { strict: true })) {
    value = node;
  }

  return value;
}

// JSON Patch operation "add" can be used to add a new property to an existing
// object in a document or overwrite an existing one. It can also be used to
// insert new items into an existing array value.
//
// See [RFC6902, Section 4.1](https://datatracker.ietf.org/doc/html/rfc6902#section-4.1)
//
// Examples:
//
// add({ foo: 'bar' }, '/foo', 'baz')
// // { foo: 'baz' }
//
// add({ foo: 'bar' }, '/baz', 'qux')
// // { foo: 'bar', baz: 'qux' }
//
// add({ foo: ['bar', qux'] }, '/foo/1', 'baz')
// // { foo: ['bar', 'baz', 'qux'] }
//
// add({ foo: ['bar'] }, '/foo/-', 'baz')
// // { foo: ['bar', 'baz'] }
//
// add({ q: { bar: 2 } }, '/a/b', 'c')
// // Error: invalid pointer /a/b
function add(document, path, value) {
  let parent = null;
  let node = document;
  let lastToken = null;

  // walk through the pointer, keeping track of the parent token/node
  for (const { node: next, token } of walk(document, path)) {
    parent = node;
    node = next;
    lastToken = token;
  }

  // if there is no parent, the pointer is invalid since we cannot add anything
  // in that scenario
  if (!parent) {
    throw new InvalidPointerError(path);
  }

  if (Array.isArray(parent)) {
    // if the pointer references an index to an array, try to add the new value
    // into the array
    try {
      const index = parseArrayIndex(lastToken, parent);
      parent.splice(index, 0, value);
    } catch (e) {
      throw new InvalidPointerError(path);
    }
  } else {
    // otherwise, either overwrite the existing item or add a new one if it did
    // not already exist
    Object.assign(parent, { [lastToken]: value });
  }

  return document;
}

// JSON Patch operation "remove" can be used to remove the document value
// associated with a given JSON pointer. It can also be used to remove an item
// from an existing array value.
//
// See [RFC6902, Section 4.2](https://datatracker.ietf.org/doc/html/rfc6902#section-4.2)
//
// Examples:
//
// remove({ foo: 'bar' }, '/foo')
// // {}
//
// remove({ foo: ['bar', 'qux', 'baz'] }, '/foo/1')
// // { foo: ['bar', 'baz'] }
//
// remove({ foo: 'bar' }, '/qux')
// // Error: invalid pointer /qux
function remove(document, path) {
  let parent = null;
  let node = document;
  let lastToken = null;

  for (const { node: next, token } of walk(document, path)) {
    parent = node;
    node = next;
    lastToken = token;
  }

  if (!parent) {
    throw new InvalidPointerError(path);
  }

  if (Array.isArray(parent)) {
    try {
      const index = parseArrayIndex(lastToken, parent);
      parent.splice(index, 1);
    } catch (e) {
      throw new InvalidPointerError(path);
    }
  } else if (node) {
    delete parent[lastToken];
  } else {
    throw new InvalidPointerError(path);
  }

  return document;
}

// JSON Patch operation "replace" can be used to change the value of an existing
// JSON pointer within a document. It can be expressed in terms of a remove and
// an add operation for the same pointer.
//
// See [RFC6902, Section 4.3](https://datatracker.ietf.org/doc/html/rfc6902#section-4.3)
//
// Examples:
//
// replace({ foo: 'bar' }, '/foo', 'baz')
// // { foo: 'baz' }
//
// replace({ foo: 'bar' }, '/baz', 'qux')
// // Error: invalid pointer /baz
function replace(document, path, value) {
  remove(document, path);
  add(document, path, value);
  return document;
}

// JSON Patch operation "move" can be used to swap the location of an existing
// document pointer value. It can be expressed in terms of a removal of one
// pointer and an add of another pointer with the same value.
//
// See [RFC6902, Section 4.4](https://datatracker.ietf.org/doc/html/rfc6902#section-4.4)
//
// Examples:
//
// move({ foo: 42 }, '/foo', '/bar')
// // { bar: 42 }
//
// move({ foo: 42 }, '/bar', 'baz')
// // Error: invalid pointer /bar
function move(document, from, to) {
  const value = get(document, from);
  remove(document, from);
  add(document, to, value);
  return document;
}

// JSON Patch operation "copy" can be used to duplicate an existing document
// pointer value to a new pointer. It can be expressed in terms of an add
// operation using the value from an existing pointer.
//
// See [RFC6902, Section 4.5](https://datatracker.ietf.org/doc/html/rfc6902#section-4.5)
//
// Examples:
//
// copy({ foo: 42 }, '/foo', '/bar')
// // { foo: 42, bar: 42 }
//
// copy({ foo: 42 }, '/bar', '/baz')
// // Error: invalid pointer /bar
function copy(document, from, to) {
  add(document, to, get(document, from));
  return document;
}

// JSON Patch operation "test" can be used to check if an existing document
// pointer matches a specified value. It will throw an error if the test fails.
// The unchanged document will be returned if the test passes.
//
// See [RFC6902, Section 4.6](https://datatracker.ietf.org/doc/html/rfc6902#section-4.6)
//
// Examples:
//
// test({ foo: { bar: 'baz' } }, '/foo/bar', { bar: 'baz' })
// // { foo: { bar: 'baz' } }
//
// test({ foo: { bar: 'baz' } }, '/foo/bar', { bar: 'baz', qux: 42 })
// // Error: test failed
function test(document, path, value) {
  function isEqual(a, b) {
    const typeA = typeof a;
    const typeB = typeof b;
    if (typeA !== typeB) {
      return false;
    }

    switch (typeA) {
    case OBJECT: {
      // recursively compare children of objects and arrays to deeply check that
      // all values are equal
      const aKeys = Object.keys(a);
      const bKeys = Object.keys(b);
      return aKeys.length === bKeys.length && aKeys.every((key, i) => (
        key === bKeys[i] && isEqual(a[key], b[key])
      ));
    }
    default:
      return a === b;
    }
  }

  const actual = get(document, path);
  if (!isEqual(value, actual)) {
    throw new Error('test failed');
  }

  return document;
}

const Operation = {
  add: (document, { path, value }) => add(document, path, value),
  copy: (document, { from, path }) => copy(document, from, path),
  move: (document, { from, path }) => move(document, from, path),
  remove: (document, { path }) => remove(document, path),
  replace: (document, { path, value }) => replace(document, path, value),
  test: (document, { path, value }) => test(document, path, value),
};

// Applies an individual JSON patch operation to an existing document and
// returns the result.
function applyOperation(document, { op, ...args }) {
  const operation = Operation[op];
  if (!operation) {
    throw new Error('unknown operation');
  }

  return operation(document, args);
}

// Applies a JSON patch to an existing document and returns the result.
//
// The patch is an array of operation objects as specified by RFC6902.
//
// See [RFC6902](https://datatracker.ietf.org/doc/html/rfc6902)
function applyPatch(document, patch) {
  return patch.reduce(applyOperation, document);
}

// eslint-disable-next-line import/prefer-default-export
export { applyPatch as apply };
