/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { getSetting } from 'docc-render/utils/theme-settings';

export default {
  created() {
    if (this.pageTitle) {
      const themeTitle = getSetting(['meta', 'title'], process.env.VUE_APP_TITLE);
      const title = [this.pageTitle, themeTitle].filter(Boolean);
      document.title = title.join(' | ');
    }
  },
};
