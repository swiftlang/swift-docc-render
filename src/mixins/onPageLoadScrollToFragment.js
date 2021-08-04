/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { waitFrames } from 'docc-render/utils/loading';
import scrollToElement from 'docc-render/mixins/scrollToElement';

export default {
  mixins: [scrollToElement],
  async mounted() {
    if (this.$route.hash) {
      await waitFrames(8);
      this.scrollToElement(this.$route.hash);
    }
  },
};
