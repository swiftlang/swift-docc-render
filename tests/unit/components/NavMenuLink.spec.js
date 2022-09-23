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
import { shallowMount } from '@vue/test-utils';
import Reference from '@/components/ContentNode/Reference.vue';

const mountItem = attrs => shallowMount(NavMenuLink, {
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

  it('renders a <Reference> for local routes', () => {
    const wrapper = mountItem({
      propsData: { url: '/foo/bar' },
      mocks: { $route: { path: '/foo/baz', query: {} } },
      slots: { default: 'Blah' },
    });

    const link = wrapper.find(Reference);
    expect(link.exists()).toBe(true);
    expect(link.classes('nav-menu-link')).toBe(true);
    expect(link.props('url')).toEqual('/foo/bar');
    expect(link.text()).toBe('Blah');
  });
});
