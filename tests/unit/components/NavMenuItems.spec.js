/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NavMenuItems from 'docc-render/components/NavMenuItems.vue';
import { shallowMount } from '@vue/test-utils';

const createWrapper = args => shallowMount(NavMenuItems, args);

describe('NavMenuItems', () => {
  it('renders the NavMenuItems', () => {
    const wrapper = createWrapper();
    expect(wrapper.element.tagName.toLowerCase() === 'ul');
    expect(wrapper.classes()).toContain('nav-menu-items');
  });

  it('renders data in it`s default slot', () => {
    const wrapper = createWrapper({
      slots: {
        default: '<div class="foo">Foo</div>',
      },
    });

    expect(wrapper.findComponent('.foo').text()).toEqual('Foo');
  });
});
