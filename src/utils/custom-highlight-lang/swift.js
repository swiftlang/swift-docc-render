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

export default function (hljs) {
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
      begin: /(struct|protocol|extension|enum|actor|class\b(?!.*\bfunc\b))/,
    };
  }

  return language;
}
