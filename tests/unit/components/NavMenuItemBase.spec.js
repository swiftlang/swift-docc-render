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
import NavMenuItemBase from 'docc-render/components/NavMenuItemBase.vue';

describe('NavMenuItemBase', () => {
  it('renders a li.nav-menu-item with a default slot', () => {
    const wrapper = shallowMount(NavMenuItemBase, {
      slots: {
        default: '<div>Foo</div>',
      },
    });
    expect(wrapper.is('li.nav-menu-item')).toBe(true);
    expect(wrapper.text()).toEqual('Foo');
  });

  it('adds the animated class if by default, and removes it via `animate` prop', () => {
    const wrapper = shallowMount(NavMenuItemBase);
    expect(wrapper.classes()).toContain('nav-menu-item--animated');
    wrapper.setProps({
      animate: false,
    });
    expect(wrapper.classes()).not.toContain('nav-menu-item--animated');
  });
});
