/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  convertChildrenArrayToObject,
  getAllChildren,
  getChildren,
  getParents,
  getSiblings,
} from '@/utils/navigatorIndex';
import { TopicTypes } from '@/constants/TopicTypes';
import { INDEX_ROOT_KEY } from 'docc-render/constants/sidebar';

const root0 = {
  type: TopicTypes.collection,
  path: '/documentation/testkit',
  title: 'TopLevel',
  uid: 1,
  parent: INDEX_ROOT_KEY,
  depth: 0,
  index: 0,
  childUIDs: [
    2,
    3,
  ],
};

const root0Child0 = {
  type: TopicTypes.struct,
  path: '/documentation/testkit/first-child-depth-1',
  title: 'First Child, Depth 1',
  uid: 2,
  parent: root0.uid,
  depth: 1,
  index: 0,
  childUIDs: [],
};

const root0Child1 = {
  type: TopicTypes.func,
  path: '/documentation/testkit/second-child-depth-1',
  title: 'Second Child, Depth 1',
  uid: 3,
  parent: root0.uid,
  depth: 1,
  index: 1,
  childUIDs: [
    4,
  ],
};

const root0Child1GrandChild0 = {
  type: TopicTypes.article,
  path: '/documentation/testkit/second-child-depth-1/first-child-depth-2',
  title: 'First Child, Depth 2',
  uid: 4,
  parent: root0Child1.uid,
  depth: 2,
  index: 0,
  childUIDs: [],
};

const root1 = {
  abstract: [{
    text: 'Create a tutorial.',
    type: 'text',
  }],
  type: TopicTypes.project,
  path: '/tutorials/testkit/gettingstarted',
  title: 'Getting Started',
  uid: 5,
  parent: INDEX_ROOT_KEY,
  depth: 0,
  index: 1,
  childUIDs: [],
};

const children = [
  root0,
  root0Child0,
  root0Child1,
  root0Child1GrandChild0,
  root1,
];

const childrenMap = {
  [root0.uid]: root0,
  [root0Child0.uid]: root0Child0,
  [root0Child1.uid]: root0Child1,
  [root0Child1GrandChild0.uid]: root0Child1GrandChild0,
  [root1.uid]: root1,
};

describe('navigatorIndex', () => {
  it('it generates a map of the flattenIndex, with the uid as the key', () => {
    const childrenObjects = convertChildrenArrayToObject(children);
    expect(childrenObjects).toEqual(childrenMap);
  });

  it('it gets all children of a node recursively', () => {
    const childNodes = getAllChildren(root0.uid, childrenMap);
    expect(childNodes).toEqual([root0, root0Child0, root0Child1, root0Child1GrandChild0]);
  });

  it('it gets the direct child nodes of a node.', () => {
    const childNodes = getChildren(root0.uid, childrenMap, children);
    expect(childNodes).toEqual([root0Child0, root0Child1]);
  });

  it('it gets all the parents of a node, up to the root', () => {
    const childNodes = getParents(root0Child1GrandChild0.uid, childrenMap);
    expect(childNodes).toEqual([root0, root0Child1, root0Child1GrandChild0]);
  });

  it('it gets all sibling nodes of a node', () => {
    const childNodes = getSiblings(root0Child1.uid, childrenMap, children);
    expect(childNodes).toEqual([root0Child0, root0Child1]);
  });
});
