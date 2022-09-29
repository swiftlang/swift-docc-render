/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { INDEX_ROOT_KEY } from 'docc-render/constants/sidebar';
import { TopicTypes } from 'docc-render/constants/TopicTypes';

/**
 * Generates a unique hash, from a string, generating a signed number.
 * @returns Number
 */
export function hashCode(str) {
  return str.split('').reduce((prevHash, currVal) => (
    // eslint-disable-next-line no-bitwise
    (((prevHash << 5) - prevHash) + currVal.charCodeAt(0)) | 0
  ), 0);
}

/**
 * @param {{path: string, type: string, title: string, children?: [] }[]} childrenNodes
 * @param {NavigatorFlatItem | null} parent
 * @param {Number} depth
 * @param {Boolean} parentBetaStatus
 * @return {NavigatorFlatItem[]}
 */
export function flattenNestedData(
  childrenNodes,
  parent = null,
  depth = 0,
  parentBetaStatus = false,
) {
  let items = [];
  const len = childrenNodes.length;
  let index;
  // reference to the last label node
  let groupMarkerNode = null;
  for (index = 0; index < len; index += 1) {
    // get the children
    const { children, ...node } = childrenNodes[index];
    // generate the extra properties
    const { uid: parentUID = INDEX_ROOT_KEY } = parent || {};
    // generate a uid to track by
    node.uid = hashCode(`${parentUID}+${node.path}_${depth}_${index}`);
    // store the parent uid
    node.parent = parentUID;
    // store the current groupMarker reference
    if (node.type === TopicTypes.groupMarker) {
      node.deprecatedChildrenCount = 0;
      groupMarkerNode = node;
    } else if (groupMarkerNode) {
      // push the current node to the group marker before it
      groupMarkerNode.childUIDs.push(node.uid);
      // store the groupMarker UID for each item
      node.groupMarkerUID = groupMarkerNode.uid;
      if (node.deprecated) {
        // count deprecated children, so we can hide the entire group when filtering
        groupMarkerNode.deprecatedChildrenCount += 1;
      }
    }
    // store which item it is
    node.index = index;
    // store how many siblings it has
    node.siblingsCount = len;
    // store the depth
    node.depth = depth;
    // store child UIDs
    node.childUIDs = [];
    // if the parent is not the root, push to its childUIDs the current node uid
    if (parent) {
      // push child to parent
      parent.childUIDs.push(node.uid);
    }
    // if the parent or the entire technology are marked as `Beta`,
    // child elements do not get marked as `Beta`.
    if (node.beta && parentBetaStatus) {
      node.beta = false;
    }

    items.push(node);
    if (children) {
      // return the children to the parent
      items = items.concat(flattenNestedData(
        children, node, depth + 1, parentBetaStatus || node.beta,
      ));
    }
  }
  return items;
}
