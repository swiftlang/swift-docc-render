/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { INDEX_ROOT_KEY } from 'docc-render/constants/sidebar';

// eslint-disable-next-line import/prefer-default-export
export function convertChildrenArrayToObject(children) {
  return children.reduce((all, current) => {
    // eslint-disable-next-line no-param-reassign
    all[current.uid] = current;
    return all;
  }, {});
}

/**
 * Get all children of a node recursively
 * @param {number} uid - the UID of the node
 * @return {NavigatorFlatItem[]}
 */
export function getAllChildren(uid, childrenMap) {
  const collection = new Set([]);
  const stack = [uid];
  let current = null;
  // loop over the stack
  while (stack.length) {
    // get the top item
    current = stack.shift();
    // find the object
    const obj = childrenMap[current];
    // add it's uid
    collection.add(obj);
    // add all if it's children to the front of the stack
    stack.unshift(...obj.childUIDs);
  }
  return [...collection];
}

/**
 * Get the direct child nodes of a node.
 * @return {NavigatorFlatItem[]}
 */
export function getChildren(uid, childrenMap, children) {
  if (uid === INDEX_ROOT_KEY) {
    return children.filter(node => node.parent === INDEX_ROOT_KEY);
  }
  const item = childrenMap[uid];
  if (!item) return [];
  return (item.childUIDs || [])
    .map(child => childrenMap[child]);
}

/**
 * Get all the parents of a node, up to the root.
 * @param {number} uid
 * @return {NavigatorFlatItem[]}
 */
export function getParents(uid, childrenMap) {
  const arr = [];
  const stack = [uid];
  let current = null;

  // loop over the stack
  while (stack.length) {
    // get the top item
    current = stack.pop();
    // find the object
    const obj = childrenMap[current];
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
}

/**
 * Get all sibling nodes of a node
 * @return {NavigatorFlatItem[]}
 */
export function getSiblings(uid, childrenMap, children) {
  const item = childrenMap[uid];
  if (!item) return [];
  return getChildren(item.parent, childrenMap, children);
}
