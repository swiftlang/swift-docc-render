/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { documentationTopicName } from 'docc-render/constants/router';

/**
 * Pixel based value for the extra scroll offset for doc pages.
 * @type {number}
 */
export const EXTRA_DOCUMENTATION_OFFSET = 10;

/**
 * @param {import('vue-router').Route} to
 * @returns {Number}
 */
export default function getExtraScrollOffset(to) {
  const { name } = to;
  const isDocumentation = name.includes(documentationTopicName);
  return isDocumentation ? EXTRA_DOCUMENTATION_OFFSET : 0;
}
