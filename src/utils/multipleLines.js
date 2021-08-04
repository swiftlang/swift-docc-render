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
 * Calculates if element has multiple lines depending on its height and line height
 * @param el
 * @returns {Boolean}
 */
// eslint-disable-next-line import/prefer-default-export
export function hasMultipleLines(el) {
  if (!el) return false;

  const computedStyle = window.getComputedStyle(el.$el || el);
  const height = (el.$el || el).offsetHeight;

  const lineHeight = computedStyle.lineHeight ? parseFloat(computedStyle.lineHeight) : 1;
  const paddingTop = computedStyle.paddingTop ? parseFloat(computedStyle.paddingTop) : 0;
  const paddingBottom = computedStyle.paddingBottom ? parseFloat(computedStyle.paddingBottom) : 0;
  const borderTopWidth = computedStyle.borderTopWidth
    ? parseFloat(computedStyle.borderTopWidth) : 0;
  const borderBottomWidth = computedStyle.borderBottomWidth
    ? parseFloat(computedStyle.borderBottomWidth) : 0;

  const internalHeight = height - (paddingTop + paddingBottom + borderTopWidth + borderBottomWidth);

  const lines = internalHeight / lineHeight;

  return lines >= 2;
}
