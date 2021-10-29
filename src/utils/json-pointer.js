/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

const SEPARATOR = '/';

function decode(token) {
  // Decode escaped character sequences:
  //   * replace "~0" with "~"
  //   * replace "~1" with "/"
  return token.replace(/~[0,1]/g, match => (({
    '~0': '~',
    '~1': '/',
  })[match] || match));
}

// This can be used to lazily generate a sequence of the individual decoded
// reference tokens contained within a given JSON pointer, which are separated
// by the "/" character. Within each token, the string "~0" is decoded to "~"
// and the string "~1" is decoded to "/".
//
// Examples:
//
// [...tokenize('')]       // []
// [...tokenize('!')]      // []
// [...tokenize('/')]      // ['']
// [...tokenize('/a/b/c')] // ['a', 'b', 'c']
// [...tokenize('/~0/~1']) // ['~', '/']
//
// for (const token of tokenize('/a/b/c')) {
//   // ...
// }
function* tokenize(pointer) {
  const start = 1;
  if (pointer.length < start || pointer.charAt(0) !== SEPARATOR) {
    return;
  }

  let encodedToken = '';
  let i = start;
  while (i < pointer.length) {
    const char = pointer.charAt(i);

    if (char === SEPARATOR) {
      yield decode(encodedToken);
      encodedToken = '';
    } else {
      encodedToken += char;
    }
    i += 1;
  }

  yield decode(encodedToken);
}

// eslint-disable-next-line import/prefer-default-export
export { tokenize };
