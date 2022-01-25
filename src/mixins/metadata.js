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

export default {
  methods: {
    /**
     * Extract and join all the values from key 'text' on every object inside an array of objects,
     * if there is an inlineContent array, it will extract all its text recursively as well
     * @param {Array} content - array of objects containing "text" key
     * @returns {String}
     */
    extractText(content) {
      return content.reduce((acc, { text, inlineContent = [] }) => (
        acc.concat(text || this.extractText(inlineContent)).filter(Boolean)
      ), []).join('');
    },
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
