/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { escapeRegExp, whiteSpaceIgnorantRegex } from 'docc-render/utils/strings';

// eslint-disable-next-line import/prefer-default-export
export function safeHighlightPattern(text) {
  const sanitizedText = whiteSpaceIgnorantRegex(escapeRegExp(text));
  return new RegExp(sanitizedText, 'ig');
}
