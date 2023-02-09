/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NavigatorDataProvider from '@/components/Navigator/NavigatorDataProvider.vue';
import { shallowMount } from '@vue/test-utils';
import Language from 'docc-render/constants/Language';
import { TopicTypes } from '@/constants/TopicTypes';
import { fetchIndexPathsData } from '@/utils/data';
import { INDEX_ROOT_KEY } from '@/constants/sidebar';
import { flushPromises } from '../../../../test-utils';

jest.mock('docc-render/utils/data');

const technologyUrl = '/documentation/foo';

const extendedTechnologies = {
  path: '/documentation/foo',
  children: [
    {
      id: 'Group Marker',
      title: 'Group Marker',
      type: TopicTypes.groupMarker,
    },
    {
      id: 'Child0',
      title: 'Child0',
      path: '/documentation/foo/child0',
      type: 'article',
      children: [
        {
          id: 'Group Marker, Child 0',
          title: 'Group Marker, Child 0',
          type: TopicTypes.groupMarker,
        },
        {
          id: 'Child0_GrandChild0',
          title: 'Child0_GrandChild0',
          path: '/documentation/foo/child0/grandchild0',
          type: 'tutorial',
        },
        {
          id: 'Child0_GrandChild1',
          title: 'Child0_GrandChild1',
          path: '/documentation/foo/child0/grandchild1',
          type: 'tutorial',
          children: [{
            id: 'Child0_GrandChild0_GreatGrandChild0',
            title: 'Child0_GrandChild0_GreatGrandChild0',
            path: '/documentation/foo/child0/grandchild0/greatgrandchild0',
            type: 'tutorial',
          }],
        },
        {
          id: 'Child0_GrandChild2',
          title: 'Child0_GrandChild2',
          path: '/documentation/foo/child0/grandchild2',
          type: 'tutorial',
        },
      ],
    },
    {
      id: 'Child1',
      title: 'Child1',
      path: '/documentation/foo/child1/',
      type: 'tutorial',
      children: [{
        id: 'Child1_GrandChild0',
        title: 'Child1_GrandChild0',
        path: '/documentation/foo/child1/grandchild0',
        type: 'method',
      }],
    },
  ],
};

const flatChildren = [
  {
    uid: -196255993,
    parent: '<root>',
    index: 0,
    siblingsCount: 3,
    depth: 0,
    childUIDs: [],
  },
  {
    uid: -196255992,
    parent: '<root>',
    index: 1,
    siblingsCount: 3,
    depth: 0,
    childUIDs: [],
  },
  {
    uid: -196255991,
    parent: '<root>',
    index: 2,
    siblingsCount: 3,
    depth: 0,
    childUIDs: [],
  },
];

const swiftIndexOne = {
  id: 'foo',
  path: technologyUrl,
  children: [1, 2, 3],
};
const swiftIndexTwo = {
  id: 'bar',
  path: '/bar',
  children: [1],
};
const objectiveCIndexOne = {
  id: 'foo-objc',
  path: technologyUrl,
  children: [1],
};

const references = {
  foo: { bar: 'bar' },
};

const response = {
  interfaceLanguages: {
    [Language.swift.key.url]: [
      swiftIndexOne,
      swiftIndexTwo,
    ],
    [Language.objectiveC.key.url]: [
      objectiveCIndexOne,
    ],
  },
  references,
};

fetchIndexPathsData.mockResolvedValue(response);

const defaultProps = {
  technologyUrl,
};

let props = {};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(NavigatorDataProvider, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  scopedSlots: {
    default: (p) => {
      props = p;
      return 'Text';
    },
  },
  ...others,
});

describe('NavigatorDataProvider', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('fetches data when mounting NavigatorDataProvider', async () => {
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(0);
    createWrapper();
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(1);
    expect(props).toHaveProperty('isFetching', true);
    await flushPromises();
    expect(props).toEqual({
      apiChanges: null,
      isFetchingAPIChanges: false,
      isFetching: false,
      technology: swiftIndexOne,
      errorFetching: false,
      flatChildren,
      references,
    });
  });

  it('fetches data, even if being passed a none-root technology url', async () => {
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(0);
    createWrapper({
      propsData: {
        technologyUrl: `${technologyUrl}/bar/baz`,
      },
    });
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(1);
    expect(props).toHaveProperty('isFetching', true);
    await flushPromises();
    expect(props).toEqual({
      apiChanges: null,
      isFetchingAPIChanges: false,
      isFetching: false,
      technology: swiftIndexOne,
      errorFetching: false,
      flatChildren,
      references,
    });
  });

  it('sets errorFetching to true, when request errored', async () => {
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(0);
    fetchIndexPathsData.mockRejectedValueOnce('Error');
    createWrapper();
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(1);
    expect(props).toHaveProperty('isFetching', true);
    await flushPromises();
    expect(props).toEqual({
      apiChanges: null,
      isFetchingAPIChanges: false,
      isFetching: false,
      technology: undefined,
      errorFetching: true,
      flatChildren: [],
      references: {},
    });
  });

  it('returns objc data', async () => {
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(0);
    createWrapper({
      propsData: {
        interfaceLanguage: Language.objectiveC.key.url,
      },
    });
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(1);
    expect(props).toHaveProperty('isFetching', true);
    await flushPromises();
    expect(props).toEqual({
      apiChanges: null,
      isFetchingAPIChanges: false,
      errorFetching: false,
      isFetching: false,
      technology: objectiveCIndexOne,
      flatChildren: [{
        uid: -196255993,
        parent: '<root>',
        index: 0,
        siblingsCount: 1,
        depth: 0,
        childUIDs: [],
      }],
      references,
    });
  });

  it('falls back to swift items, if no objc items', async () => {
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(0);
    fetchIndexPathsData.mockResolvedValueOnce({
      interfaceLanguages: {
        [Language.swift.key.url]: response.interfaceLanguages[Language.swift.key.url],
      },
      references,
    });
    createWrapper({
      propsData: {
        interfaceLanguage: Language.objectiveC.key.url,
      },
    });
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(1);
    expect(props).toHaveProperty('isFetching', true);
    await flushPromises();
    expect(props).toEqual({
      apiChanges: null,
      isFetchingAPIChanges: false,
      errorFetching: false,
      isFetching: false,
      technology: swiftIndexOne,
      flatChildren,
      references,
    });
  });

  it('returns undefined technology, if none matches', async () => {
    createWrapper({
      propsData: {
        technologyUrl: '/documentation/bar',
      },
    });
    await flushPromises();
    expect(props).toEqual({
      apiChanges: null,
      isFetchingAPIChanges: false,
      errorFetching: false,
      isFetching: false,
      technology: undefined,
      flatChildren: [],
      references,
    });
  });

  it('returns undefined technology when index response is empty', async () => {
    const emptyResponse = { interfaceLanguages: {} };
    fetchIndexPathsData.mockResolvedValue(emptyResponse);
    createWrapper();
    await flushPromises();
    expect(props).toEqual({
      apiChanges: null,
      isFetchingAPIChanges: false,
      isFetching: false,
      technology: undefined,
      errorFetching: false,
      flatChildren: [],
      references: undefined,
    });
  });

  it('counts the amount of deprecated items a groupMarker has', async () => {
    const technologyClone = JSON.parse(JSON.stringify(extendedTechnologies));
    technologyClone.children[1].deprecated = true;
    technologyClone.children[2].deprecated = true;
    technologyClone.children[1].children[1].deprecated = true;
    fetchIndexPathsData.mockResolvedValue({
      interfaceLanguages: {
        [Language.swift.key.url]: [
          technologyClone,
        ],
      },
    });
    createWrapper();
    await flushPromises();
    expect(props.flatChildren[0]).toHaveProperty('deprecatedChildrenCount', 2);
    expect(props.flatChildren).toMatchSnapshot();
  });

  it('removes the `beta` flag from children, if the parent is a `beta`', () => {
    const technologyClone = JSON.parse(JSON.stringify(extendedTechnologies));
    technologyClone.beta = true;
    technologyClone.children[1].beta = true;
    technologyClone.children[1].children[0].beta = true;
    fetchIndexPathsData.mockResolvedValue({
      interfaceLanguages: {
        [Language.swift.key.url]: [
          technologyClone,
        ],
      },
    });
    createWrapper();
    expect(props).toMatchSnapshot();
  });

  it('removes the `beta` flag from children, if the parent is a `beta`', () => {
    const technologyClone = JSON.parse(JSON.stringify(extendedTechnologies));
    technologyClone.children[1].beta = true;
    technologyClone.children[1].children[1].beta = true;
    // case where the direct parent is NOT `Beta`, but an ancestor is
    technologyClone.children[1].children[2].children[0].beta = true;
    // set an end node as beta
    technologyClone.children[2].children[0].beta = true;
    fetchIndexPathsData.mockResolvedValue({
      interfaceLanguages: {
        [Language.swift.key.url]: [
          technologyClone,
        ],
      },
    });
    createWrapper();
    expect(props).toMatchSnapshot();
  });

  it('flattens deeply nested children and provides them to the NavigatorCard', async () => {
    fetchIndexPathsData.mockResolvedValue({
      interfaceLanguages: {
        [Language.swift.key.url]: [{
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
        }],
      },
    });
    createWrapper();
    await flushPromises();
    expect(props.flatChildren).toEqual([
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
    ]);
  });
});
