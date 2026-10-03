/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

/** Convenient shorthand for `Object.hasOwn`. */
export const has = Object.hasOwn;
/**
 * Copies source.property, if it exists, to destination.property.
 * @param {string} property
 * @param {object} source
 * @param {object} destination
 */
export function copyPropertyIfPresent(property, source, destination) {
  if (has(source, property)) {
    // eslint-disable-next-line no-param-reassign
    destination[property] = source[property];
  }
}

/**
 * Copies all specified properties present in the source to the destination.
 * @param {string[]} properties
 * @param {object} source
 * @param {object} destination
 */
export function copyPresentProperties(properties, source, destination) {
  properties.forEach((property) => {
    copyPropertyIfPresent(property, source, destination);
  });
}

/**
 * Throws an error if `object` has the property `property`.
 * @param {object} object
 * @param {string} property
 * @param {string} errorMessage
 */
export function mustNotHave(object, property, errorMessage) {
  if (has(object, property)) {
    throw new Error(errorMessage);
  }
}
