/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import Language from 'docc-render/constants/Language';

function indentObjcDeclaration(codeElement) {
  // find all param name spans (which are tokenized as "token-identifier"s)
  const params = codeElement.getElementsByClassName('token-identifier');
  if (params.length < 2) {
    return;
  }

  // use the position of the first keyword colon separator as the offset
  // to determine indentation for following lines
  const offset = codeElement.textContent.indexOf(':') + 1;

  // loop through every param name (after the first one) and calculate/apply the
  // number of spaces to indent by subtracting the length of the name from the
  // original offset
  // eslint-disable-next-line no-plusplus
  for (let i = 1; i < params.length; i++) {
    const originalHtml = params[i].innerHTML.trim();
    const originalText = params[i].textContent.trim();

    const paramLen = originalText.length;
    const numSpaces = Math.max(0, offset - paramLen);

    params[i].innerHTML = `\n${' '.repeat(numSpaces)}${originalHtml}`;
  }

  // Adds a newline to the end of the code listing if there isn't one. Without it,
  // the <wbr> elements will impact items on the last line, when we don't want
  // it to (after applying this indentation logic)
  if (codeElement.innerHTML.charAt(codeElement.innerHTML.length - 1) !== '\n') {
    // eslint-disable-next-line no-param-reassign
    codeElement.innerHTML = `${codeElement.innerHTML}\n`;
  }
}

function indentSwiftDeclaration(codeElement) {
  // the token-keyword token can be used to pivot on the type of declaration
  const reservedWords = codeElement.getElementsByClassName('token-keyword');

  // determine the appropriate param element to start with when applying
  // indentation and newlines: 1 for initializers and functions.
  let startIndex;
  // eslint-disable-next-line no-plusplus
  for (let i = 0; i < reservedWords.length; i++) {
    switch (reservedWords[i].textContent.trim()) {
    case 'func':
    case 'init':
      startIndex = 1;
      break;
      // no default
    }

    // found an initializer or a function, stop looking
    if (startIndex) {
      break;
    }
  }

  // don't attempt indentation for symbols other than initializers or functions
  if (!startIndex) {
    return;
  }

  // find all param identifiers
  const params = codeElement.getElementsByClassName('token-externalParam');
  if (startIndex >= params.length) {
    return;
  }

  // use the position of the first parenthesis as the offset to determine
  // indentation for following lines
  const offset = codeElement.textContent.indexOf('(');

  // loop through every param name (after the first one) and calculate/apply the
  // number of spaces to indent by subtracting the length of the name from the
  // original offset
  // eslint-disable-next-line no-plusplus
  for (let i = startIndex; i < params.length; i++) {
    const originalHtml = params[i].innerHTML.trim();
    const originalText = params[i].textContent.trim();

    const paramLen = originalText.length;
    const numSpaces = Math.max(0, offset - paramLen);

    params[i].innerHTML = `\n${' '.repeat(numSpaces)}${originalHtml}`;
  }

  // Adds a newline to the end of the code listing if there isn't one. Without it,
  // the <wbr> elements will impact items on the last line, when we don't want
  // it to (after applying this indentation logic)
  if (codeElement.innerHTML.charAt(codeElement.innerHTML.length - 1) !== '\n') {
    // eslint-disable-next-line no-param-reassign
    codeElement.innerHTML = `${codeElement.innerHTML}\n`;
  }
}

/**
 * Indents content declaration tokens
 * Works only for Swift and Objc
 * @param {HTMLElement} codeElement
 * @param {('occ'|'swift')} language
 */
// eslint-disable-next-line import/prefer-default-export
export function indentDeclaration(codeElement, language) {
  const originalHtml = codeElement.innerHTML;

  try {
    switch (language) {
    case Language.objectiveC.key.api:
      indentObjcDeclaration(codeElement);
      break;
    case Language.swift.key.api:
      indentSwiftDeclaration(codeElement);
      break;
      // no default
    }
  } catch (_) {
    // eslint-disable-next-line no-param-reassign
    codeElement.innerHTML = originalHtml;
  }
}
