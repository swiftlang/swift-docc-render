/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import swift from 'highlight.js/lib/languages/swift';

export default function swiftOverride(hljs) {
  const language = swift(hljs);

  const isClassMode = ({ beginKeywords = '' }) => beginKeywords
    .split(' ')
    .includes('class');
  const classModeIndex = language.contains.findIndex(isClassMode);
  if (classModeIndex >= 0) {
    const {
      beginKeywords, // purposefully strip this out
      ...classMode
    } = language.contains[classModeIndex];
    // Update the existing "class" mode by replacing the `beginKeywords` with
    // a `begin` regular expression, which is careful not to mistakenly
    // recognize class function declarations as class declarations
    language.contains[classModeIndex] = {
      ...classMode,
      begin: /\b(struct|protocol|extension|enum|actor|class\b(?!.*\bfunc))\b/,
    };
  }

  // Checks if a given language sub-mode matches the "ESCAPED_NEWLINE" from the
  // built-in Swift parser from hljs
  const isEscapedNewlineMode = (mode) => {
    const { className, match } = mode;
    if (className !== 'subst' || !match) {
      return false;
    }

    const matchStr = match.toString();
    return matchStr.startsWith('\\') && matchStr.endsWith('[\\t ]*(?:[\\r\\n]|\\r\\n)');
  };

  // replace the "ESCAPED_NEWLINE" sub-mode in the multiline string literal mode
  // variants so that it doesn't include the actual newline characters in the
  // span token that it generates, because this causes issues with our
  // line-number + multi-line string literal logic when the span for the
  // backslash token is split across multiple lines
  const strIndex = language.contains.findIndex(({ className }) => className === 'string');
  language.contains[strIndex] = {
    ...language.contains[strIndex],
    variants: language.contains[strIndex].variants.map(variant => ({
      ...variant,
      contains: variant.contains.map(mode => (isEscapedNewlineMode(mode) ? ({
        className: 'subst',
        begin: /\\#{0,3}/,
        end: /[\t ]*(?:[\r\n]|\r\n)/,
        // same match as the original one but with an explicit start/end match so
        // that the end one can be excluded from the resulting span
        excludeEnd: true,
      }) : (
        mode
      ))),
    })),
  };

  return language;
}
