/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { config } from '@vue/test-utils';
import { defaultLocale } from 'docc-render/lang';

config.mocks = {
  $t: tKey => tKey,
  $tc: tKey => tKey,
  $i18n: {
    locale: defaultLocale,
  },
};
