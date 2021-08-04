/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

export const BreakpointName = {
  large: 'large',
  medium: 'medium',
  small: 'small',
};

const breakpointWeights = {
  [BreakpointName.small]: 0,
  [BreakpointName.medium]: 1,
  [BreakpointName.large]: 2,
};

/**
 * Returns whether the provided breakpoint is above the target
 * @param {'small'|'medium'|'large'} breakpoint - Breakpoint to test.
 * @param {'small'|'medium'|'large'} target - Target breakpoint.
 * @return {boolean}
 */
export function isBreakpointAbove(breakpoint, target) {
  return breakpointWeights[breakpoint] > breakpointWeights[target];
}
