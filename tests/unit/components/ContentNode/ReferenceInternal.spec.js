/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import {
  RouterLinkStub,
  shallowMount,
} from '@vue/test-utils';
import ReferenceInternal from 'docc-render/components/ContentNode/ReferenceInternal.vue';

describe('ReferenceInternal', () => {
  it('renders a <router-link>', () => {
    const wrapper = shallowMount(ReferenceInternal, {
      propsData: { url: '/foo/bar' },
      slots: { default: 'FooBar' },
      stubs: { 'router-link': RouterLinkStub },
    });
    const link = wrapper.find(RouterLinkStub);
    expect(link.exists()).toBe(true);
    expect(link.props('to')).toBe('/foo/bar');
    expect(link.text()).toBe('FooBar');
  });

  it('renders a span if not active', () => {
    const wrapper = shallowMount(ReferenceInternal, {
      propsData: { url: '/foo/bar', isActive: false },
      slots: { default: 'FooBar' },
    });

    expect(wrapper.is('span')).toBe(true);
    expect(wrapper.attributes()).toEqual({});
    expect(wrapper.text()).toEqual('FooBar');
  });
});
