/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NavMenuLink from 'docc-render/components/NavMenuLink.vue';
import { RouterLinkStub, shallowMount } from '@vue/test-utils';

const mountItem = attrs => shallowMount(NavMenuLink, {
  stubs: { RouterLinkStub },
  ...attrs,
});

describe('NavMenuLink', () => {
  it('renders a span.nav-menu-link.current for the current url', () => {
    let currentUrl = { name: 'foo' };
    let wrapper = mountItem({
      propsData: { url: currentUrl },
      mocks: { $route: currentUrl },
      slots: { default: 'Foo' },
    });

    const span = wrapper.find('span.nav-menu-link.current');
    expect(span.exists()).toBe(true);
    expect(span.attributes('aria-current')).toBe('page');
    expect(span.attributes('aria-disabled')).toBe('true');
    expect(span.attributes('role')).toBe('link');
    expect(span.text()).toBe('Foo');

    currentUrl = '/foo';
    wrapper = mountItem({
      propsData: { url: currentUrl },
      mocks: { $route: { name: 'foo', path: '/foo', query: { foo: 'bar' } } },
      slots: { default: 'Foo' },
    });
    expect(wrapper.contains('span.nav-menu-link.current')).toBe(true);
  });

  it('sets a link as current, even if url has a trailing slash', () => {
    const currentUrl = 'documentation';
    const wrapper = mountItem({
      propsData: { url: currentUrl },
      mocks: { $route: { path: `${currentUrl}/` } },
    });
    expect(wrapper.find('span.nav-menu-link').classes()).toContain('current');
  });

  it('renders a <router-link> for local routes', () => {
    const wrapper = mountItem({
      propsData: { url: { name: 'blah' } },
      mocks: { $route: { name: 'foobar' } },
      stubs: { 'router-link': RouterLinkStub },
      slots: { default: 'Blah' },
    });

    const link = wrapper.find(RouterLinkStub);
    expect(link.exists()).toBe(true);
    expect(link.classes('nav-menu-link')).toBe(true);
    expect(link.props('to')).toEqual({ name: 'blah' });
    expect(link.text()).toBe('Blah');
  });
});
