/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/**
 * A window.getSelection utility that works with all browsers.
 * Firefox does not work with window.getSelection on `input` elements,
 * IE does not support it at all.
 * @returns {string}
 */
export function getSelectionText() {
  if (window.getSelection) {
    try {
      const { activeElement } = document;
      if (activeElement && activeElement.value) {
        // firefox bug https://bugzilla.mozilla.org/show_bug.cgi?id=85686
        return activeElement.value.substring(
          activeElement.selectionStart,
          activeElement.selectionEnd,
        );
      }
      return window.getSelection().toString();
    } catch (e) {
      return '';
    }
  } else if (document.selection && document.selection.type !== 'Control') {
    // For IE
    return document.selection.createRange().text;
  }
  return '';
}

/**
 * Moves a cursor to the end of an input
 * @param {HTMLInputElement} el
 */
export function moveCursorToEnd(el) {
  if (typeof el.selectionStart === 'number') {
    // eslint-disable-next-line
    el.selectionStart = el.selectionEnd = el.value.length;
  } else if (typeof el.createTextRange !== 'undefined') {
    el.focus();
    const range = el.createTextRange();
    range.collapse(false);
    range.select();
  }
}

/**
 * Moves a cursor to the start of an input
 * @param {HTMLInputElement} el
 */
export function moveCursorToStart(el) {
  // eslint-disable-next-line
  el.selectionStart = el.selectionEnd = 0;
}

export function isSingleCharacter(key) {
  return /^[\w\W\s]$/.test(key);
}
