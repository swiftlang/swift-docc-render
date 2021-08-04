/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { isBreakpointAbove, BreakpointName } from 'docc-render/utils/breakpoints';

describe('breakpoint', () => {
  it.each([
    [BreakpointName.small, BreakpointName.large, false],
    [BreakpointName.medium, BreakpointName.large, false],
    [BreakpointName.large, BreakpointName.medium, true],
    [BreakpointName.large, BreakpointName.small, true],
    [BreakpointName.medium, BreakpointName.small, true],
    [BreakpointName.small, BreakpointName.medium, false],
  ])('`isBreakpointAbove` when given "%s" and "%s" it returns "%s"', (a, b, expected) => {
    expect(isBreakpointAbove(a, b)).toBe(expected);
  });
});
