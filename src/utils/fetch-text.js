/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { resolveAbsoluteUrl } from 'docc-render/utils/url-helper';

/**
 * Fetch the contents of a file as text.
 * @param {string} filepath The file path.
 * @param {RequestInit?} options Optional request settings.
 * @returns {Promise<string>} The text contents of the file.
 */
export default async function fetchText(filepath, options) {
  const url = resolveAbsoluteUrl(filepath);
  return fetch(url, options)
    .then(r => r.text());
}
