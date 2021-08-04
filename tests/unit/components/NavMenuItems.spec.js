/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
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
    expect(wrapper.is('ul'));
    expect(wrapper.classes()).toContain('nav-menu-items');
  });

  it('adds the provided children count as a data prop', () => {
    const wrapper = createWrapper({
      propsData: {
        previousSiblingChildren: 5,
      },
    });
    expect(wrapper.attributes()).toHaveProperty('data-previous-menu-children-count', '5');
  });

  it('renders data in it`s default slot', () => {
    const wrapper = createWrapper({
      slots: {
        default: '<div class="foo">Foo</div>',
      },
    });

    expect(wrapper.find('.foo').text()).toEqual('Foo');
  });
});
