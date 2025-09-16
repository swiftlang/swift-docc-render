/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/
import { shallowMount } from '@vue/test-utils';
import Language from 'docc-render/constants/Language';
import indexDataGetter from 'docc-render/mixins/indexDataGetter';
import IndexStore from 'docc-render/stores/IndexStore';

const swiftIndex = [{
  id: 'foo',
  path: '/documentation/swift',
  children: [1, 2, 3],
}];

const objectiveCIndex = [{
  id: 'foo-objc',
  path: '/documentation/objc',
  children: [1],
}];

const references = {
  foo: { identifier: 'foo' },
  bar: { identifier: 'bar' },
};

const swiftDiff = {
  '/documentation/swift': 'modified',
};

const objectiveCDiff = {
  '/documentation/objc': 'modified',
};

const includedArchiveIdentifiers = ['foo', 'bar'];

const swiftProps = {
  technology: 'swift',
  technologyPath: '/documentation/swift',
  isTechnologyBeta: false,
};

const objectiveCProps = {
  technology: 'objective-c',
  technologyPath: '/documentation/objc',
  isTechnologyBeta: false,
};

const mockState = () => ({
  flatChildren: {
    [Language.swift.key.url]: swiftIndex,
  },
  references,
  apiChanges: {
    [Language.swift.key.url]: swiftDiff,
  },
  apiChangesVersion: 'version0',
  includedArchiveIdentifiers,
  errorFetching: false,
  errorFetchingDiffs: false,
  technologyProps: {
    [Language.swift.key.url]: swiftProps,
  },
});

const Component = {
  name: 'MyComponent',
  template: '<div/>',
  mixins: [indexDataGetter],
  props: {
    interfaceLanguage: {
      type: String,
      required: false,
    },
    technology: {
      type: Object,
      required: false,
    },
    selectedAPIChangesVersion: {
      type: String,
      required: false,
    },
  },
};

const technology = {
  title: 'title',
  path: '/documentation/boo',
};

const createWrapper = () => shallowMount(Component, {
  propsData: {
    interfaceLanguage: Language.swift.key.url,
    technology,
    selectedAPIChangesVersion: 'version0',
  },
});

describe('indexDataGetter', () => {
  it('selects correct language variant when it exists`', async () => {
    IndexStore.state = mockState();
    const wrapper = createWrapper();
    expect(wrapper.vm.indexNodes).toEqual(swiftIndex);
    expect(wrapper.vm.technologyProps).toEqual(swiftProps);

    await wrapper.setData({
      indexState: {
        flatChildren: {
          [Language.objectiveC.key.url]: objectiveCIndex,
        },
        technologyProps: {
          [Language.objectiveC.key.url]: objectiveCProps,
        },
        apiChanges: {
          [Language.objectiveC.key.url]: objectiveCDiff,
        },
      },
    });
    await wrapper.setProps({
      interfaceLanguage: Language.objectiveC.key.url,
    });
    expect(wrapper.vm.indexNodes).toEqual(objectiveCIndex);
    expect(wrapper.vm.technologyProps).toEqual(objectiveCProps);
    expect(wrapper.vm.apiChanges).toEqual(objectiveCDiff);
  });

  it('selects swift variant when language is objc but its data does not exist`', async () => {
    IndexStore.state = mockState();
    const wrapper = createWrapper();
    await wrapper.setProps({
      interfaceLanguage: Language.objectiveC.key.url,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.indexNodes).toEqual(swiftIndex);
    expect(wrapper.vm.technologyProps).toEqual(swiftProps);
    expect(wrapper.vm.apiChanges).toEqual(swiftDiff);
  });

  it('return undefined `apiChanges` if `apiChangesVersion` does not match selected version`', () => {
    IndexStore.state = {
      ...mockState(),
      apiChangesVersion: 'version1',
    };
    const wrapper = createWrapper();
    expect(wrapper.vm.apiChanges).toEqual(undefined);
  });

  it('return undefined `apiChanges` if `errorFetchingDiffs``', () => {
    IndexStore.state = {
      ...mockState(),
      errorFetchingDiffs: true,
    };
    const wrapper = createWrapper();
    expect(wrapper.vm.apiChanges).toEqual(undefined);
  });

  it('when no index data is unavailable through IndexStore, fallback to technology provided in prop`', async () => {
    IndexStore.state = {
      ...mockState(),
      flatChildren: {},
      technologyProps: {},
    };
    const wrapper = createWrapper();
    expect(wrapper.vm.indexNodes).toEqual([]);
    // fallback to technology if provided thru prop
    expect(wrapper.vm.technologyProps).toEqual({
      technology: technology.title,
      technologyPath: technology.path,
      isTechnologyBeta: technology.beta,
    });

    await wrapper.setProps({
      technology: null,
    });
    expect(wrapper.vm.indexNodes).toEqual([]);
    // if not provided, set to null
    expect(wrapper.vm.technologyProps).toEqual(null);
  });

  it('falls back to using the `technology.url` if no path', async () => {
    const fallbackTechnology = {
      title: 'FallbackTechnology',
      url: '/url/to/technology',
    };
    IndexStore.state = {
      ...mockState(),
      technologyProps: {},
    };
    const wrapper = createWrapper();
    await wrapper.setProps({
      technology: fallbackTechnology,
    });

    expect(wrapper.vm.technologyProps.technologyPath).toEqual(fallbackTechnology.url);
  });

  it('computes the correct fetching status`', async () => {
    IndexStore.state = {
      ...mockState(),
      flatChildren: null,
      errorFetching: true,
    };
    const wrapper = createWrapper();
    // not `isFetching` if no fetched data and there was an error
    expect(wrapper.vm.navigatorProps.isFetching).toBe(false);

    // fetching if no fetched data and no error
    await wrapper.setData({
      indexState: {
        errorFetching: false,
      },
    });
    expect(wrapper.vm.navigatorProps.isFetching).toBe(true);

    // not fetching if fetched data is not null
    await wrapper.setData({
      indexState: {
        flatChildren: {},
      },
    });
    expect(wrapper.vm.navigatorProps.isFetching).toBe(false);
  });
});
