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
import { fetchIndexPathsData } from 'docc-render/utils/data';
import Language from 'docc-render/constants/Language';
import { flushPromises } from '../../../../test-utils';

jest.mock('docc-render/utils/data');

const technology = {
  title: 'Technology Name',
  url: '/documentation/foo',
};

const swiftIndexOne = {
  id: 'foo',
  path: technology.url,
  children: [1, 2, 3],
};
const swiftIndexTwo = {
  id: 'bar',
  path: '/bar',
  children: [1],
};
const objectiveCIndexOne = {
  id: 'foo-objc',
  path: technology.url,
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
  technology,
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
      references,
    });
  });

  it('fetches data, even if being passed a none-root technology url', async () => {
    expect(fetchIndexPathsData).toHaveBeenCalledTimes(0);
    createWrapper({
      propsData: {
        technology: {
          ...technology,
          url: `${technology.url}/bar/baz`,
        },
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
      references,
    });
  });

  it('returns undefined technology, if none matches', async () => {
    createWrapper({
      propsData: {
        technology: {
          url: '/documentation/bar',
        },
      },
    });
    await flushPromises();
    expect(props).toEqual({
      apiChanges: null,
      isFetchingAPIChanges: false,
      errorFetching: false,
      isFetching: false,
      technology: undefined,
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
      references: undefined,
    });
  });
});
