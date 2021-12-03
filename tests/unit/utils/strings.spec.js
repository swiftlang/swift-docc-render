/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  anchorize,
  cssEscapeTopicIdHash,
  escapeHtml,
  escapeRegExp,
  pluralize,
  deleteSpaces,
  whiteSpaceIgnorantRegex, insertAt,
} from 'docc-render/utils/strings';

describe('anchorize', () => {
  it('works with simple words', () => {
    expect(anchorize('word')).toBe('word');
    expect(anchorize('Word')).toBe('word');
    expect(anchorize('WordOne')).toBe('wordone');
    expect(anchorize('Word125')).toBe('word125');
  });

  it('removes and condense spaces', () => {
    expect(anchorize('Hello word')).toBe('hello-word');
    expect(anchorize('hello     Word')).toBe('hello-word');
    expect(anchorize('    hello WordOne   ')).toBe('hello-wordone');
  });

  it('removes special characters', () => {
    expect(anchorize('Hello"word')).toBe('hello-word');
    expect(anchorize('Hello`word')).toBe('hello-word');
    expect(anchorize('Hello<word')).toBe('hello-word');
    expect(anchorize('Hello>word')).toBe('hello-word');
  });

  it('keeps multiple dashes in the middle when coming from a special character', () => {
    expect(anchorize('Hello""word')).toBe('hello--word');
  });

  it('trim initial dashes', () => {
    expect(anchorize('<<< Hello word')).toBe('hello-word');
  });

  it('leaves trailing dashes', () => {
    expect(anchorize('Hello word>>')).toBe('hello-word--');
  });
});

describe('escapeHtml', () => {
  it('escapes unsafe html characters', () => {
    expect(escapeHtml(
      '<a href="#" title="\'">&</a>',
    )).toBe(
      '&lt;a href=&quot;#&quot; title=&quot;&apos;&quot;&gt;&amp;&lt;/a&gt;',
    );
  });
});

describe('pluralize', () => {
  it('return word + `s` if value is plural', () => {
    expect(pluralize('word', ['A', 'B'])).toBe('words');
  });
  it('return word + `s` if value is 0', () => {
    expect(pluralize('word', [])).toBe('words');
  });
  it('return word in original form if value is singular', () => {
    expect(pluralize('word', ['A'])).toBe('word');
  });
  it('return technology in correct plural form', () => {
    expect(pluralize('technology', ['A', 'B'])).toBe('technologies');
  });
});

describe('cssEscapeTopicIdHash', () => {
  it('returns strings without a leading hashtag/digit unchanged', () => {
    expect(cssEscapeTopicIdHash('abc')).toBe('abc');
    expect(cssEscapeTopicIdHash('#abc')).toBe('#abc');
    expect(cssEscapeTopicIdHash('#a42')).toBe('#a42');
    expect(cssEscapeTopicIdHash('42')).toBe('42');
    expect(cssEscapeTopicIdHash('')).toBe('');
  });

  it('escapes the leading digit for numeric topic ID selectors (using unicode code point and space)', () => {
    expect(cssEscapeTopicIdHash('#4')).toBe('#\\34 ');
    expect(cssEscapeTopicIdHash('#42')).toBe('#\\34 2');
    expect(cssEscapeTopicIdHash('#4222')).toBe('#\\34 222');
    expect(cssEscapeTopicIdHash('#1965709')).toBe('#\\31 965709');
  });
});

describe('escapeRegExp', () => {
  it('escapes special regular expression characters using backslash', () => {
    expect(escapeRegExp('.')).toBe('\\.');
    expect(escapeRegExp('*')).toBe('\\*');
    expect(escapeRegExp('+')).toBe('\\+');
    expect(escapeRegExp('\\')).toBe('\\\\');
    expect(escapeRegExp('-')).toBe('\\-');
    expect(escapeRegExp('?')).toBe('\\?');
    expect(escapeRegExp('^')).toBe('\\^');
    expect(escapeRegExp('$')).toBe('\\$');
    expect(escapeRegExp('{')).toBe('\\{');
    expect(escapeRegExp('}')).toBe('\\}');
    expect(escapeRegExp('(')).toBe('\\(');
    expect(escapeRegExp(')')).toBe('\\)');
    expect(escapeRegExp('|')).toBe('\\|');
    expect(escapeRegExp('[')).toBe('\\[');
    expect(escapeRegExp(']')).toBe('\\]');
    expect(escapeRegExp('/ab+c/')).toBe('/ab\\+c/');
    expect(escapeRegExp('foobar')).toBe('foobar');
    expect(escapeRegExp('')).toBe('');
    expect(escapeRegExp('｡^･ｪ･^｡')).toBe('｡\\^･ｪ･\\^｡');
  });
});

describe('whiteSpaceIgnorantRegex', () => {
  it('adds white space matches before each character', () => {
    expect(whiteSpaceIgnorantRegex('abc')).toBe('\\s*a\\s*b\\s*c');
  });

  it('takes into consideration escaped characters', () => {
    expect(whiteSpaceIgnorantRegex('a\\[\\.\\')).toBe(
      /* eslint-disable no-useless-concat */
      '\\s*' + 'a'
      + '\\s*' + '\\['
      + '\\s*' + '\\.'
      + '\\s*' + '\\',
    );
  });

  it('skips white spaces between characters', () => {
    expect(whiteSpaceIgnorantRegex('  a     b   ')).toBe(
      '\\s*' + 'a'
      + '\\s*' + 'b',
    );
  });

  it('reduces multiple empty spaces to a single one, so no infinite matchers are returned', () => {
    expect(whiteSpaceIgnorantRegex('  ')).toBe(' ');
  });
});

describe('deleteSpaces', () => {
  it('deletes spaces on any string', () => {
    expect(deleteSpaces('F o o')).toBe('Foo');
    expect(deleteSpaces('Fo o')).toBe('Foo');
    expect(deleteSpaces(' F o o ')).toBe('Foo');
    expect(deleteSpaces('Foo ')).toBe('Foo');
  });
});

describe('insertAt', () => {
  const base = 'base';
  const insert = 'foo';
  it('inserts a string with negative position, from the end', () => {
    expect(insertAt(base, insert, -3)).toBe('bfooase');
  });
  it('inserts a string at the beginning', () => {
    expect(insertAt(base, insert, 0)).toBe('foobase');
  });
  it('inserts a string at the start, if no number provided', () => {
    expect(insertAt(base, insert)).toBe('foobase');
  });
  it('inserts a string at the end, if number is too big', () => {
    expect(insertAt(base, insert, 1000)).toBe('basefoo');
  });
  it('inserts a string at an index', () => {
    expect(insertAt(base, insert, 2)).toBe('bafoose');
  });
});
