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
  whiteSpaceIgnorantRegex,
  insertAt,
  firstParagraph,
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
  it('throws an error when en-US one/other choices are not provided', () => {
    expect(() => pluralize({}, 1)).toThrow();
    expect(() => pluralize({}, 0)).toThrow();
    expect(() => pluralize({}, 42)).toThrow();
    expect(() => pluralize({ en: 'foo' }, 42)).toThrow();
    expect(() => pluralize({ sl: { one: 'a', other: 'b' } })).toThrow();
    expect(() => pluralize({ en: { one: 'foo' } }, 42)).toThrow();
  });

  describe('en', () => {
    const one = 'day';
    const other = 'days';
    const choices = { en: { one, other } };

    it('returns the "one" choice for a count of 1', () => {
      expect(pluralize(choices, 1)).toBe(one);
    });

    it('returns the "other" choice for integers that are not 1', () => {
      expect(pluralize(choices, 0)).toBe(other);
      expect(pluralize(choices, 2)).toBe(other);
      expect(pluralize(choices, 42)).toBe(other);
    });
  });

  describe('with other locales', () => {
    let languages;

    const en = {
      one: 'day',
      other: 'days',
    };
    const sl = {
      one: 'ura',
      two: 'uri',
      few: 'ure',
      other: 'ur',
    };
    const choices = { en, sl };

    beforeEach(() => {
      languages = navigator.languages;
      // stub `navigator.languages` to simulate a runtime with an alternate locale
      // eslint-disable-next-line
      navigator.__defineGetter__('languages', () => ['sl']);
    });

    afterEach(() => {
      // restore original value of `navigator.languages`
      // eslint-disable-next-line
      navigator.__defineGetter__('languages', () => languages);
    });

    it('uses translated text for the appropriate locale and plural rule', () => {
      expect(pluralize(choices, 1)).toBe(sl.one);
      expect(pluralize(choices, 2)).toBe(sl.two);
      expect(pluralize(choices, 3)).toBe(sl.few);
      expect(pluralize(choices, 4)).toBe(sl.few);
      expect(pluralize(choices, 5)).toBe(sl.other);
      expect(pluralize(choices, 0)).toBe(sl.other);
    });

    it('falls back to "en" if the appropriate translation is not provided', () => {
      expect(pluralize({ en }, 1)).toBe(en.one);
      expect(pluralize({ en }, 2)).toBe(en.other);
      expect(pluralize({ en }, 3)).toBe(en.other);
      expect(pluralize({ en }, 4)).toBe(en.other);
      expect(pluralize({ en }, 5)).toBe(en.other);
      expect(pluralize({ en }, 0)).toBe(en.other);
    });
  });
});

describe('cssEscapeTopicIdHash', () => {
  const escapeSpy = jest.spyOn(CSS, 'escape');

  it('calls CSS.escape', () => {
    expect(escapeSpy).not.toHaveBeenCalled();
    // not a match
    expect(cssEscapeTopicIdHash('abc')).toBe('abc');
    expect(escapeSpy).not.toHaveBeenCalled();
    // is a match
    expect(cssEscapeTopicIdHash('#abc')).toBe('#abc');
    expect(escapeSpy).toHaveBeenCalledTimes(1);
    expect(escapeSpy).toHaveBeenCalledWith('abc');
  });

  it('escapes bad css selector characters', () => {
    expect(cssEscapeTopicIdHash('#abc.')).toBe('#abc\\.');
    expect(cssEscapeTopicIdHash('#ab c.:!')).toBe('#ab\\ c\\.\\:\\!');
  });

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
    expect(whiteSpaceIgnorantRegex('abc')).toBe('a\\s*b\\s*c');
  });

  it('takes into consideration escaped characters', () => {
    expect(whiteSpaceIgnorantRegex('a\\[\\.\\')).toBe(
      /* eslint-disable no-useless-concat */
      'a'
      + '\\s*' + '\\['
      + '\\s*' + '\\.'
      + '\\s*' + '\\',
    );
  });

  it('skips white spaces between characters', () => {
    expect(whiteSpaceIgnorantRegex('  a     b   ')).toBe(
      'a'
      + '\\s*' + 'b',
    );
  });

  it('reduces multiple empty spaces to a single one, so no infinite matchers are returned', () => {
    expect(whiteSpaceIgnorantRegex('  ')).toBe(' ');
  });

  it('skips the first char, even if its an escape character', () => {
    expect(whiteSpaceIgnorantRegex('\\[\\.\\')).toBe(
      /* eslint-disable no-useless-concat */
      '\\['
      + '\\s*' + '\\.'
      + '\\s*' + '\\',
    );
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

describe('firstParagraph', () => {
  it('returns a string without paragraphs unchanged', () => {
    expect(firstParagraph('')).toBe('');
    expect(firstParagraph('abc')).toBe('abc');
  });

  it('handles Unix system newlines', () => {
    expect(firstParagraph('abc\ndef\nghi')).toBe('abc');
  });

  it('handles Windows system newlines', () => {
    expect(firstParagraph('abc\r\ndef\r\nghi')).toBe('abc');
  });

  it('returns an empty string if the character is a newline', () => {
    expect(firstParagraph('\n')).toBe('');
  });
});
