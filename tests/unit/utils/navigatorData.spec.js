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
  flattenNestedData,
  getAllChildren,
  getChildren,
  getParents,
  getSiblings,
  hashCode,
} from 'docc-render/utils/navigatorData';
import { TopicTypes } from '@/constants/TopicTypes';
import { INDEX_ROOT_KEY } from '@/constants/sidebar';

const technologyWithChildren = {
  path: '/documentation/foo',
  children: [
    {
      title: 'Group Marker',
      type: TopicTypes.groupMarker,
    },
    {
      title: 'Child0',
      path: '/foo/child0',
      type: 'article',
      children: [
        {
          title: 'Group Marker, Child 0',
          type: TopicTypes.groupMarker,
        },
        {
          title: 'Child0_GrandChild0',
          path: '/foo/child0/grandchild0',
          type: 'tutorial',
        },
        {
          title: 'Child0_GrandChild1',
          path: '/foo/child0/grandchild1',
          type: 'tutorial',
          children: [{
            title: 'Child0_GrandChild0_GreatGrandChild0',
            path: '/foo/child0/grandchild0/greatgrandchild0',
            type: 'tutorial',
          }],
        },
        {
          title: 'Child0_GrandChild2',
          path: '/foo/child0/grandchild2',
          type: 'tutorial',
        },
      ],
    },
    {
      title: 'Child1',
      path: '/foo/child1/',
      type: 'tutorial',
      children: [{
        title: 'Child1_GrandChild0',
        path: '/foo/child1/grandchild0',
        type: 'method',
      }],
    },
  ],
};

const flatTechnology = [
  {
    childUIDs: [
      551503844,
      -97593391,
    ],
    deprecatedChildrenCount: 0,
    depth: 0,
    index: 0,
    parent: INDEX_ROOT_KEY,
    siblingsCount: 3,
    title: 'Group Marker',
    type: 'groupMarker',
    uid: -196255993,
  },
  {
    childUIDs: [
      -361407047,
      1438225895,
      1439149417,
      1440072939,
    ],
    depth: 0,
    groupMarkerUID: -196255993,
    index: 1,
    parent: INDEX_ROOT_KEY,
    path: '/foo/child0',
    siblingsCount: 3,
    title: 'Child0',
    type: 'article',
    uid: 551503844,
  },
  {
    childUIDs: [
      1438225895,
      1439149417,
      1440072939,
    ],
    deprecatedChildrenCount: 0,
    depth: 1,
    index: 0,
    parent: 551503844,
    siblingsCount: 4,
    title: 'Group Marker, Child 0',
    type: 'groupMarker',
    uid: -361407047,
  },
  {
    childUIDs: [],
    depth: 1,
    groupMarkerUID: -361407047,
    index: 1,
    parent: 551503844,
    path: '/foo/child0/grandchild0',
    siblingsCount: 4,
    title: 'Child0_GrandChild0',
    type: 'tutorial',
    uid: 1438225895,
  },
  {
    childUIDs: [
      305326087,
    ],
    depth: 1,
    groupMarkerUID: -361407047,
    index: 2,
    parent: 551503844,
    path: '/foo/child0/grandchild1',
    siblingsCount: 4,
    title: 'Child0_GrandChild1',
    type: 'tutorial',
    uid: 1439149417,
  },
  {
    childUIDs: [],
    depth: 2,
    index: 0,
    parent: 1439149417,
    path: '/foo/child0/grandchild0/greatgrandchild0',
    siblingsCount: 1,
    title: 'Child0_GrandChild0_GreatGrandChild0',
    type: 'tutorial',
    uid: 305326087,
  },
  {
    childUIDs: [],
    depth: 1,
    groupMarkerUID: -361407047,
    index: 3,
    parent: 551503844,
    path: '/foo/child0/grandchild2',
    siblingsCount: 4,
    title: 'Child0_GrandChild2',
    type: 'tutorial',
    uid: 1440072939,
  },
  {
    childUIDs: [
      -827353283,
    ],
    depth: 0,
    groupMarkerUID: -196255993,
    index: 2,
    parent: INDEX_ROOT_KEY,
    path: '/foo/child1/',
    siblingsCount: 3,
    title: 'Child1',
    type: 'tutorial',
    uid: -97593391,
  },
  {
    childUIDs: [],
    depth: 1,
    index: 0,
    parent: -97593391,
    path: '/foo/child1/grandchild0',
    siblingsCount: 1,
    title: 'Child1_GrandChild0',
    type: 'method',
    uid: -827353283,
  },
];

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

describe('index data', () => {
  it('generates a unique hash', () => {
    // make sure hashCode returns a unique hash from a string
    expect(hashCode('foo')).toBe(101574);
    expect(hashCode('oof')).toBe(110214);
    expect(hashCode('ofo')).toBe(109944);
    expect(hashCode('foo1')).toBe(3148843);
    // make sure hash is never too big
    expect(hashCode('foo1'.repeat(10))).toBe(-1535108562);
    expect(hashCode('foo1'.repeat(50))).toBe(-2107259162);
  });

  it('flattens deeply nested children', () => {
    expect(
      flattenNestedData(technologyWithChildren.children, null, 0),
    ).toEqual(flatTechnology);
  });

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
