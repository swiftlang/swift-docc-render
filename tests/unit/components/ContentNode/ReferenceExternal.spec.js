/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import ReferenceExternal from 'docc-render/components/ContentNode/ReferenceExternal.vue';

describe('ReferenceExternal', () => {
  it('renders a normal link', () => {
    const wrapper = shallowMount(ReferenceExternal, {
      propsData: { url: 'https://foo.bar' },
      slots: { default: 'Foo Bar' },
    });
    expect(wrapper.is('a')).toBe(true);
    expect(wrapper.attributes('href')).toBe('https://foo.bar');
    expect(wrapper.text()).toBe('Foo Bar');
  });

  it('renders an inactive link', () => {
    const wrapper = shallowMount(ReferenceExternal, {
      propsData: { url: 'https://foo.bar', isActive: false },
      slots: { default: 'Foo Bar' },
    });

    expect(wrapper.is('span')).toBe(true);
    expect(wrapper.attributes()).toEqual({});
    expect(wrapper.text()).toEqual('Foo Bar');
  });
});
