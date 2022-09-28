/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import getExtraScrollOffset, { EXTRA_DOCUMENTATION_OFFSET } from 'docc-render/utils/scroll-offset';
import { documentationTopicName } from 'docc-render/constants/router';

describe('scroll-offset', () => {
  it('returns extra offset for documentation pages', () => {
    expect(getExtraScrollOffset({ name: documentationTopicName }))
      .toEqual(EXTRA_DOCUMENTATION_OFFSET);
  });

  it('falls back to 0 for other pages', () => {
    expect(getExtraScrollOffset({ name: 'foo' }))
      .toEqual(0);
  });
});
