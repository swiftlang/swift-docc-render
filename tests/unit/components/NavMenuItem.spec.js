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
  shallowMount,
} from '@vue/test-utils';
import NavMenuItem from 'docc-render/components/NavMenuItem.vue';
import NavMenuItemBase from 'docc-render/components/NavMenuItemBase.vue';
import NavMenuLink from 'docc-render/components/NavMenuLink.vue';

describe('NavMenuItem', () => {
  const mountItem = opts => shallowMount(NavMenuItem, {
    propsData: {
      url: 'foo',
    },
    ...opts,
  });

  it('renders a NavMenuItemBase', () => {
    const wrapper = mountItem();
    expect(wrapper.find(NavMenuItemBase).exists()).toBe(true);
  });

  it('renders a NavMenuLink', () => {
    const wrapper = mountItem();
    const link = wrapper.find(NavMenuLink);
    expect(link.exists()).toBe(true);
    expect(link.props()).toHaveProperty('url', 'foo');
  });

  it('renders a default slot inside NavMenuLink', () => {
    const wrapper = mountItem({
      slots: {
        default: '<div class="foo">Foo</div>',
      },
    });
    expect(wrapper.find(NavMenuLink).find('.foo').exists()).toBe(true);
  });
});
