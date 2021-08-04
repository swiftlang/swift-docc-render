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
import Badge from 'docc-render/components/Badge.vue';

describe('Badge', () => {
  it('renders a .badge', () => {
    const wrapper = shallowMount(Badge);
    expect(wrapper.classes()).toEqual(['badge']);
    expect(wrapper.text()).toBe('');
  });

  it('renders "Deprecated"', () => {
    const wrapper = shallowMount(Badge, {
      propsData: {
        variant: 'deprecated',
      },
    });
    expect(wrapper.classes()).toEqual(['badge', 'badge-deprecated']);
    expect(wrapper.text()).toBe('Deprecated');
  });

  it('renders "Beta" when variant is "beta"', () => {
    const wrapper = shallowMount(Badge, {
      propsData: {
        variant: 'beta',
      },
    });
    expect(wrapper.classes()).toEqual(['badge', 'badge-beta']);
    expect(wrapper.text()).toBe('Beta');
  });

  it('renders a custom text, when variant is custom', () => {
    const wrapper = shallowMount(Badge, {
      propsData: {
        variant: 'custom',
      },
      slots: {
        default: 'Custom',
      },
    });
    expect(wrapper.classes()).toEqual(['badge', 'badge-custom']);
    expect(wrapper.text()).toBe('Custom');
  });

  it('renders custom badge variants', () => {
    const wrapper = shallowMount(Badge, {
      propsData: {
        variant: 'foo',
      },
    });
    // assert it does not add `badge-foo`.
    expect(wrapper.classes()).toEqual(['badge', 'badge-foo']);
    // Assert it does not provide default text for unknown types
    expect(wrapper.text()).toBe('');
  });

  it('renders its children', () => {
    const wrapper = shallowMount(Badge, {
      slots: {
        default: 'Foo',
      },
    });
    expect(wrapper.text()).toBe('Foo');
  });

  it('can override the children', () => {
    const wrapper = shallowMount(Badge, {
      propsData: { variant: 'beta' },
      slots: {
        default: 'Foo',
      },
    });
    expect(wrapper.text()).toBe('Foo');
  });
});
