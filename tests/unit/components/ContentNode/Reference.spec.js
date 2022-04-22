/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount, createLocalVue } from '@vue/test-utils';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import ReferenceExternal from 'docc-render/components/ContentNode/ReferenceExternal.vue';
import ReferenceInternalSymbol
  from 'docc-render/components/ContentNode/ReferenceInternalSymbol.vue';
import ReferenceInternal from 'docc-render/components/ContentNode/ReferenceInternal.vue';
import Router from 'vue-router';
import createRouterInstance from 'docc-render/setup-utils/SwiftDocCRenderRouter';
import { TopicRole } from '@/constants/roles';

const router = createRouterInstance();
const localVue = createLocalVue();
localVue.use(Router);

describe('Reference', () => {
  it('renders a `ReferenceExternal` for external urls', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: { url: 'https://foo.bar' },
      slots: { default: 'Foobar' },
    });
    const ref = wrapper.find(ReferenceExternal);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('https://foo.bar');
    expect(ref.text()).toBe('Foobar');
  });

  it('renders a `ReferenceInternal` for internal tutorials urls', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: { url: '/tutorials/bar' },
      slots: { default: 'FooBar' },
    });
    const ref = wrapper.find(ReferenceInternal);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('/tutorials/bar');
    expect(ref.text()).toBe('FooBar');
  });

  it('renders a `ReferenceInternal` for internal documentation urls', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: { url: '/documentation/bar' },
      slots: { default: 'FooBar' },
    });
    const ref = wrapper.find(ReferenceInternal);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('/documentation/bar');
    expect(ref.text()).toBe('FooBar');
  });

  it('renders a `ReferenceInternalSymbol` for external "symbol" kind references', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: {
        url: '/documentation/uikit/uiview',
        kind: 'symbol',
        role: TopicRole.symbol,
      },
      slots: { default: 'UIView' },
    });
    const ref = wrapper.find(ReferenceInternalSymbol);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('/documentation/uikit/uiview');
  });

  it('renders a `ReferenceInternal` for external "symbol" kind references with human readable name', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: {
        url: '/documentation/uikit/uiview',
        kind: 'symbol',
        role: TopicRole.symbol,
        ideTitle: 'UIView',
      },
      slots: { default: 'UIView' },
    });
    const ref = wrapper.find(ReferenceInternal);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('/documentation/uikit/uiview');
  });

  it('renders a `ReferenceInternalSymbol` for external "dictionarySymbol" kind references', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: {
        url: '/documentation/uikit/uiview',
        kind: 'symbol',
        role: TopicRole.dictionarySymbol,
      },
      slots: { default: 'UIView' },
    });
    const ref = wrapper.find(ReferenceInternalSymbol);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('/documentation/uikit/uiview');
  });

  it('renders a `ReferenceInternal` for external "dictionarySymbol" kind references with a human readable name', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: {
        url: '/documentation/uikit/uiview',
        kind: 'symbol',
        role: TopicRole.dictionarySymbol,
        ideTitle: 'UIView',
        titleStyle: 'title',
      },
      slots: { default: 'UIView' },
    });
    const ref = wrapper.find(ReferenceInternal);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('/documentation/uikit/uiview');
  });

  it('renders a `ReferenceInternalSymbol` for external "dictionarySymbol" kind references with `symbol` title style', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: {
        url: '/documentation/uikit/uiview',
        kind: 'symbol',
        role: TopicRole.dictionarySymbol,
        ideTitle: 'UIView',
        titleStyle: 'symbol',
      },
      slots: { default: 'UIView' },
    });
    const ref = wrapper.find(ReferenceInternalSymbol);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('/documentation/uikit/uiview');
  });

  it('renders a `ReferenceInternal` for references that have a "role" other than "symbol"', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: {
        url: '/documentation/uikit/uiview',
        kind: 'symbol',
        role: TopicRole.collection,
      },
      slots: { default: 'UIView' },
    });
    expect(wrapper.find(ReferenceInternalSymbol).exists()).toBe(false);
    const ref = wrapper.find(ReferenceInternal);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('/documentation/uikit/uiview');
  });

  it('passes the isActive prop', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: { url: 'https://foo.bar', isActive: true },
      slots: { default: 'Foobar' },
    });
    const ref = wrapper.find(ReferenceExternal);
    expect(ref.props('isActive')).toBe(true);
  });

  it('does not pass `isActive` if the `url` is empty string, even if there are query params', () => {
    // shim
    window.scrollTo = () => ({});
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: { url: '', isActive: true },
      slots: { default: 'Foobar' },
    });
    // add query params to url
    router.push({ query: { language: 'objc' } });
    const ref = wrapper.find(ReferenceExternal);
    // assert isActive is empty
    expect(ref.props('isActive')).toBe(false);
  });

  it('applies the query parameters to the url, if `isInternal`', () => {
    const wrapper = shallowMount(Reference, {
      propsData: { url: '/documentation/arkit', isActive: true },
      slots: { default: 'Foobar' },
      mocks: {
        $router: {
          resolve: jest.fn().mockReturnValue({ resolved: { name: '' } }),
        },
        $route: {
          query: {
            language: 'objc',
          },
        },
      },
    });
    // add query params to url
    expect(wrapper.find(ReferenceInternal).props('url')).toBe('/documentation/arkit?language=objc');
  });

  it('does not apply query parameters to the url, if not `isInternal`', () => {
    const wrapper = shallowMount(Reference, {
      propsData: { url: 'http://website.com', isActive: true },
      slots: { default: 'Foobar' },
      mocks: {
        $router: {
          resolve: jest.fn().mockReturnValue({ resolved: { name: '' } }),
        },
        $route: {
          query: {
            language: 'objc',
          },
        },
      },
    });
    // add query params to url
    expect(wrapper.find(ReferenceExternal).props('url')).toBe('http://website.com');
  });
});
