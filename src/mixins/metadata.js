/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { addMetadata } from 'docc-render/utils/metadata';
import ContentNode from 'docc-render/components/ContentNode.vue';

export default {
  methods: {
    extractText: ContentNode.methods.extractText,
  },
  computed: {
    pagePath: ({ $route: { path = '/' } = {} }) => path,
  },
  created() {
    addMetadata({
      title: this.pageTitle,
      description: this.pageDescription,
      path: this.pagePath,
    });
  },
};
