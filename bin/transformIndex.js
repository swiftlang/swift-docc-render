/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/**
 * This file is a build-time node script, that replaces all references
 * of the `BASE_URL_PLACEHOLDER` in the `index.html` file. If it finds references, it stores a
 * raw copy of the file as `index-template.html`, along with the replaced, ready to serve version
 * as `index.html`.
 *
 * To create a build with a custom base path, just set a `BASE_URL` in your env, and it will be
 * respected in the build, while still creating an `index-template.html` file.
 *
 * This process is part of the docc static-hostable transformation.
 */
const fs = require('fs');
const path = require('path');
const BASE_URL_PLACEHOLDER = require('./baseUrlPlaceholder');

const indexFile = path.join(__dirname, '../dist/index.html');
const templateFile = path.resolve(__dirname, '../dist/index-template.html');
const baseUrl = process.env.BASE_URL || '/';

try {
  // read the template file
  const data = fs.readFileSync(indexFile, 'utf8');

  if (!data.includes(BASE_URL_PLACEHOLDER)) {
    // stop if the placeholder is not found
    return;
  }

  // copy it to a new file
  fs.writeFileSync(templateFile, data, 'utf8');

  // do the replacement
  const result = data.replace(new RegExp(`${BASE_URL_PLACEHOLDER}/`, 'g'), baseUrl);

  // replace the file
  fs.writeFileSync(indexFile, result, 'utf8');
} catch (err) {
  console.error(err);
  throw new Error('index.html template processing could not finish.');
}
