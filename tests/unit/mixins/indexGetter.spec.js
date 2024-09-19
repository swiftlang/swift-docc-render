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
import indexGetter from 'docc-render/mixins/indexGetter';
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

const apiChanges = {
  interfaceLanguages: {
    [Language.swift.key.url]: [],
  },
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
  apiChanges,
  includedArchiveIdentifiers,
  errorFetching: false,
  technologyProps: {
    [Language.swift.key.url]: swiftProps,
  },
});

const Component = {
  name: 'MyComponent',
  template: '<div/>',
  mixins: [indexGetter],
  props: {
    interfaceLanguage: {
      type: String,
      required: false,
    },
    technology: {
      type: Object,
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
  },
});

describe('indexGetter', () => {
  it('selects correct language variant when it exists`', async () => {
    IndexStore.state = mockState();
    const wrapper = createWrapper();
    expect(wrapper.vm.indexNodes).toEqual(swiftIndex);
    expect(wrapper.vm.technologyProps).toEqual(swiftProps);

    wrapper.setData({
      indexState: {
        flatChildren: {
          [Language.objectiveC.key.url]: objectiveCIndex,
        },
        technologyProps: {
          [Language.objectiveC.key.url]: objectiveCProps,
        },
      },
    });
    wrapper.setProps({
      interfaceLanguage: Language.objectiveC.key.url,
    });
    expect(wrapper.vm.indexNodes).toEqual(objectiveCIndex);
    expect(wrapper.vm.technologyProps).toEqual(objectiveCProps);
  });

  it('selects swift variant when language is objc but its data does not exist`', async () => {
    IndexStore.state = mockState();
    const wrapper = createWrapper();
    wrapper.setProps({
      interfaceLanguage: Language.objectiveC.key.url,
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.vm.indexNodes).toEqual(swiftIndex);
    expect(wrapper.vm.technologyProps).toEqual(swiftProps);
  });

  it('when no index data is unavailable through IndexStore, fallback to technology provided in prop`', () => {
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

    wrapper.setProps({
      technology: null,
    });
    expect(wrapper.vm.indexNodes).toEqual([]);
    // if not provided, set to null
    expect(wrapper.vm.technologyProps).toEqual(null);
  });

  it('computes the correct fetching status`', () => {
    IndexStore.state = {
      ...mockState(),
      flatChildren: null,
      errorFetching: true,
    };
    const wrapper = createWrapper();
    // not `isFetching` if no fetched data and there was an error
    expect(wrapper.vm.navigatorProps.isFetching).toBe(false);

    // fetching if no fetched data and no error
    wrapper.setData({
      indexState: {
        errorFetching: false,
      },
    });
    expect(wrapper.vm.navigatorProps.isFetching).toBe(true);

    // not fetching if fetched data is not null
    wrapper.setData({
      indexState: {
        flatChildren: {},
      },
    });
    expect(wrapper.vm.navigatorProps.isFetching).toBe(false);
  });
});
