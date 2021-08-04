/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

// characters that we want to replace by a dash to make them valid in the hash section
// https://url.spec.whatwg.org/#fragment-percent-encode-set
const NON_URL_CHARS_RE = /(?:\s+|[`"<>])/g;
const INITIAL_DASH_RE = /^-+/;

// characters to escape for safe usage in HTML
const HTML_UNSAFE_RE = /["'&<>]/g;

/**
 * Transforms a string into a valid anchor by removing all uppercase letters
 * @param {string} str string to transform to kebab case
 */
// eslint-disable-next-line import/prefer-default-export
export function anchorize(str) {
  return str
    .trim()
    .replace(NON_URL_CHARS_RE, '-')
    .replace(INITIAL_DASH_RE, '')
    .toLowerCase();
}

export function escapeHtml(str) {
  const sanitize = character => ({
    '"': '&quot;',
    '\'': '&apos;',
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
  }[character] || character);
  return str.replace(HTML_UNSAFE_RE, sanitize);
}

// Add the correct grammatical number (singular or plural)
// to a noun depending on the number of items of an array
export function pluralize(array) {
  return array.length === 1 ? '' : 's';
}

// Escape URL hash fragments for use in CSS selectors, which is needed to
// utilize vue-router support for linking to on-page elements when the ID value
// is a number (or any string with a leading digit).
//
// This is needed because vue-router handles navigating to hash fragments by
// using CSS selectors and querySelector API from the DOM, which do not support
// selectors starting with numeric digits, even though HTML ID attributes can
// start with numeric digits and be valid.
//
// Source: https://www.w3.org/International/questions/qa-escapes#css_identifiers
//
// Example: cssEscapeTopicIdHash('#42') => '#\34 2'
export function cssEscapeTopicIdHash(hash) {
  const match = /#(\d)(.*)/.exec(hash);
  if (match === null) {
    return hash;
  }

  const [leadingDigit, rest] = match.slice(1);
  // Escape the leading digit by converting it to its unicode point escape
  // character with a trailing space ("123" => "\000031 23 " => "\31 23 ").
  // (The leading double slash is needed to encode the leading slash character)
  const escapedLeadingDigit = `\\3${leadingDigit} `;

  return `#${escapedLeadingDigit}${rest}`;
}

// Escape a string for use in a `RegExp`, which will escape any special regular
// expression characters using a backslash character. This is needed to create
// a regular expression that wants to treat these special characters as normal
// characters in a pattern string.
//
// For more information, see:
// https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Regular_Expressions#Escaping
export function escapeRegExp(str) {
  return str.replace(/[.*+\-?^${}()|[\]\\]/g, '\\$&');
}

// Deletes spaces on any string
export function deleteSpaces(str) {
  return str.replace(/\s/g, '');
}

/**
 * Loops over each character in a text query, adding white space matches before each character.
 * Can be used with text returned from {@see escapeRegExp}.
 * @param {string} stringToSanitize - the string to sanitize and add matches to
 * @return {string}
 */
export function whiteSpaceIgnorantRegex(stringToSanitize) {
  let i;
  let char;
  const spaceMatch = '\\s*';
  const singleSpace = ' ';

  // If string is only spaces, return a single space.
  // Otherwise the resulting regex may have infinite matches.
  const trimmedString = stringToSanitize.trim();
  const len = trimmedString.length;
  if (!len) return singleSpace;

  const collector = [];
  // loop over each character
  for (i = 0; i < len; i += 1) {
    char = trimmedString[i];
    // if the character is an escape char, pass it and the next character
    if (char === '\\') {
      // skip one character in next iteration
      i += 1;
      // pass both escape char and char, with an empty space match before
      collector.push(`${spaceMatch}${char}`);
      collector.push(trimmedString[i]);
      // add anything else, but empty spaces
    } else if (char !== singleSpace) {
      collector.push(`${spaceMatch}${char}`);
    }
  }
  return collector.join('');
}

/**
 * Inserts a string into another string
 * at a provided index.
 * @param {string} str - string to insert into
 * @param {string} sub - string to insert
 * @param {number} pos - position index to insert at
 * @returns {string}
 */
export function insertAt(str, sub, pos = 0) {
  return `${str.slice(0, pos)}${sub}${str.slice(pos)}`;
}
