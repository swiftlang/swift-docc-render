/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export const CURRENT_SUPPORTED_SCHEMA = {
  major: 0,
  minor: 3,
  patch: 0,
};

export function combineVersions({ major, minor, patch }) {
  return [major, minor, patch].join('.');
}

function versionNumberToArray(versionString) {
  const [major = 0, minor = 0, patch = 0] = versionString.split('.');
  return [Number(major), Number(minor), Number(patch)];
}

/**
 * Compares two version strings
 * @param {string} v1 - first version to compare
 * @param {string} v2 - second version to compare
 * @returns {Number<-1|0|1>}
 */
export function compareVersions(v1, v2) {
  const v1parts = versionNumberToArray(v1);
  const v2parts = versionNumberToArray(v2);

  // iterate over each item
  for (let i = 0; i < v1parts.length; i += 1) {
    if (v1parts[i] > v2parts[i]) {
      return 1;
    }
    if (v1parts[i] < v2parts[i]) {
      return -1;
    }
  }

  // they are identical
  return 0;
}

export const CURRENT_SCHEMA_STRING = combineVersions(CURRENT_SUPPORTED_SCHEMA);

function constructMinorVersionMessage(current) {
  return `[Swift-DocC-Render] The render node version for this page has a higher minor version (${current}) than Swift-DocC-Render supports (${CURRENT_SCHEMA_STRING}). Compatibility is not guaranteed.`;
}

const constructMajorVersionMessage = current => `[Swift-DocC-Render] The render node version for this page (${current}) has a different major version component than Swift-DocC-Render supports (${CURRENT_SCHEMA_STRING}). Compatibility is not guaranteed.`;

function getMessage(version) {
  const { major: renderMajor, minor: renderMinor } = version;
  const {
    major: supportedMajor,
    minor: supportedMinor,
  } = CURRENT_SUPPORTED_SCHEMA;
  // compare major version
  if (renderMajor !== supportedMajor) return constructMajorVersionMessage(combineVersions(version));
  if (renderMinor > supportedMinor) return constructMinorVersionMessage(combineVersions(version));
  return '';
}

export default function emitWarningForSchemaVersionMismatch(version) {
  if (!version) return;
  const message = getMessage(version);
  if (!message) return;
  console.warn(message);
}
