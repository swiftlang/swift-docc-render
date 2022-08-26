/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  INDEX_ROOT_KEY,
} from 'docc-render/constants/sidebar';

export default {
  props: {
    children: {
      type: Array,
      required: true,
    },
  },
  computed: {
    /**
    * Generates a map of the flattenIndex, with the uid as the key.
    * @return {Object.<string, NavigatorFlatItem>}
    */
    childrenMap({ children }) {
      return this.convertChildrenArrayToObject(children);
    },
  },
  methods: {
    convertChildrenArrayToObject(children) {
      return children.reduce((all, current) => {
        // eslint-disable-next-line no-param-reassign
        all[current.uid] = current;
        return all;
      }, {});
    },
    /**
     * Get all the parents of a node, up to the root.
     * @param {number} uid
     * @return {NavigatorFlatItem[]}
     */
    getParents(uid) {
      const arr = [];
      const stack = [uid];
      let current = null;

      // loop over the stack
      while (stack.length) {
        // get the top item
        current = stack.pop();
        // find the object
        const obj = this.childrenMap[current];
        if (!obj) {
          return [];
        }
        // push the object to the results
        arr.unshift(obj);
        // if the current object has a parent and its not the root, add it to the stack
        if (obj.parent && obj.parent !== INDEX_ROOT_KEY) {
          stack.push(obj.parent);
        }
      }
      return arr;
    },
  },
};
