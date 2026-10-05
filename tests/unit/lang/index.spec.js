/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2026 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { defaultLocale, messages } from 'theme/lang/index';

describe('language configuration', () => {
  it('uses the configured default locale messages', () => {
    expect(defaultLocale).toBe('en-US');
    expect(messages[defaultLocale].accessibility['skip-navigation']).toBe('Skip Navigation');
  });
});
