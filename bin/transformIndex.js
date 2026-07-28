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
import fs from 'node:fs';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import BASE_URL_PLACEHOLDER from './baseUrlPlaceholder.js';

const binDirectory = path.dirname(fileURLToPath(import.meta.url));
const indexFile = path.resolve(binDirectory, '../dist/index.html');
const templateFile = path.resolve(binDirectory, '../dist/index-template.html');
const baseUrl = process.env.BASE_URL || '/';

function transformIndex() {
  try {
    // read the template file
    const data = fs.readFileSync(indexFile, 'utf8');

    if (!data.includes(BASE_URL_PLACEHOLDER)) {
      // stop if the placeholder is not found
      return;
    }

    // Vite normalizes its base URL with a leading slash. DocC's placeholder is
    // replaced with a complete base path, so keep the placeholder itself
    // root-relative to avoid producing protocol-relative URLs after replacement.
    const template = data.replace(
      new RegExp(`/${BASE_URL_PLACEHOLDER}/`, 'g'),
      `${BASE_URL_PLACEHOLDER}/`,
    );

    // copy it to a new file
    fs.writeFileSync(templateFile, template, 'utf8');

    // do the replacement
    const result = template.replace(new RegExp(`${BASE_URL_PLACEHOLDER}/`, 'g'), baseUrl);

    // replace the file
    fs.writeFileSync(indexFile, result, 'utf8');
  } catch (err) {
    console.error(err);
    throw new Error('index.html template processing could not finish.');
  }
}

transformIndex();
