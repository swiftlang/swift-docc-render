/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount, createLocalVue } from '@vue/test-utils';
import Reference from 'docc-render/components/ContentNode/Reference.vue';
import ReferenceExternalSymbol
  from 'docc-render/components/ContentNode/ReferenceExternalSymbol.vue';
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
window.scrollTo = () => ({});

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

  it('renders a `ReferenceInternal` for a symbol with its own inline formatting', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: {
        url: '/documentation/uikit/uiview',
        kind: 'symbol',
        role: TopicRole.symbol,
        hasInlineFormatting: true,
      },
      slots: { default: 'custom text for UIView symbol' },
    });
    const ref = wrapper.find(ReferenceInternal);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('/documentation/uikit/uiview');
    expect(wrapper.find(ReferenceInternalSymbol).exists()).toBe(false);
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

  it('renders a `ReferenceExternalSymbol` for external symbols', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: {
        url: 'https://example.com/foo',
        kind: 'symbol',
        role: TopicRole.symbol,
      },
      slots: { default: 'Foo' },
    });
    const ref = wrapper.find(ReferenceExternalSymbol);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('https://example.com/foo');
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

  it('renders a `ReferenceExternal` for /downloads/ URLs', () => {
    const wrapper = shallowMount(Reference, {
      localVue,
      router,
      propsData: { url: '/downloads/foo.zip' },
      slots: { default: 'Foo' },
    });
    const ref = wrapper.find(ReferenceExternal);
    expect(ref.exists()).toBe(true);
    expect(ref.props('url')).toBe('/downloads/foo.zip');
    expect(ref.text()).toBe('Foo');
  });

  it('inactivates refs as appropriate with non-empty `includedArchiveIdentifiers`', () => {
    const createWrapper = propsData => shallowMount(Reference, {
      localVue,
      router,
      propsData,
      slots: { default: propsData.title },
    });
    const aa = createWrapper({
      identifier: 'doc://A/documentation/A/a',
      url: '/documentation/A/a',
      title: 'A.A',
      type: 'topic',
    });
    const ab = createWrapper({
      identifier: 'doc://A/documentation/A/b',
      url: '/documentation/A/b',
      title: 'A.B',
      type: 'topic',
    });
    const bb = createWrapper({
      identifier: 'doc://B/documentation/B/b',
      url: '/documentation/B/b',
      title: 'B.B',
      type: 'topic',
    });
    const bbb = createWrapper({
      identifier: 'doc://BB/documentation/BB/b',
      url: '/documentation/BB/b#b',
      title: 'BB.B',
      type: 'section',
    });
    const c = createWrapper({
      identifier: 'https://abc.dev',
      url: 'https://abc.dev',
      title: 'C',
      type: 'link',
    });

    expect(aa.find(ReferenceInternal).props('isActive')).toBe(true);
    expect(ab.find(ReferenceInternal).props('isActive')).toBe(true);
    expect(bb.find(ReferenceInternal).props('isActive')).toBe(true);
    expect(bbb.find(ReferenceInternal).props('isActive')).toBe(true);
    expect(c.find(ReferenceExternal).props('isActive')).toBe(true);

    const allIncluded = {
      appState: {
        includedArchiveIdentifiers: ['A', 'B', 'BB'],
      },
    };
    aa.setData(allIncluded);
    expect(aa.find(ReferenceInternal).props('isActive')).toBe(true);
    ab.setData(allIncluded);
    expect(ab.find(ReferenceInternal).props('isActive')).toBe(true);
    bb.setData(allIncluded);
    expect(bb.find(ReferenceInternal).props('isActive')).toBe(true);
    bbb.setData(allIncluded);
    expect(bbb.find(ReferenceInternal).props('isActive')).toBe(true);
    c.setData(allIncluded);
    expect(c.find(ReferenceExternal).props('isActive')).toBe(true);

    // with only the B archive included, only internal links within B should
    // be active (only bb in this example)
    // c is an external link so it will also remain active
    const onlyB = {
      appState: {
        includedArchiveIdentifiers: ['B'],
      },
    };
    aa.setData(onlyB);
    expect(aa.find(ReferenceInternal).props('isActive')).toBe(false);
    ab.setData(onlyB);
    expect(ab.find(ReferenceInternal).props('isActive')).toBe(false);
    bb.setData(onlyB);
    expect(bb.find(ReferenceInternal).props('isActive')).toBe(true);
    bbb.setData(onlyB);
    expect(bbb.find(ReferenceInternal).props('isActive')).toBe(false);
    c.setData(onlyB);
    expect(c.find(ReferenceExternal).props('isActive')).toBe(true);
  });
});
