/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { RouterLinkStub, shallowMount } from '@vue/test-utils';
import NavTitleContainer from 'docc-render/components/NavTitleContainer.vue';

const createWrapper = ({ propsData, slots, ...rest } = {}) => shallowMount(NavTitleContainer, {
  propsData: {
    to: 'foo',
    ...propsData,
  },
  slots: {
    default: 'Default Slot',
    subhead: 'Tutorials',
    ...slots,
  },
  stubs: {
    'router-link': RouterLinkStub,
  },
  ...rest,
});

describe('NavTitleContainer', () => {
  it('renders a router-link as root', () => {
    const wrapper = createWrapper();
    const link = wrapper.find(RouterLinkStub);

    expect(link.classes()).toContain('nav-title-content');
    expect(link.props()).toHaveProperty('to', 'foo');
  });

  it('renders a title and its slot', () => {
    const wrapper = createWrapper();
    const title = wrapper.find('.title');
    expect(title.text()).toBe('Default Slot');
  });

  it('renders a nbsp after the title', () => {
    const wrapper = createWrapper();
    expect(wrapper.element.textContent).toMatch(/Default Slot\s\xa0Tutorials/);
  });

  it('renders a subhead and its default content', () => {
    const wrapper = createWrapper();
    const title = wrapper.find('.subhead');
    expect(title.text()).toBe('Tutorials');
  });

  it('renders a subhead and its slot', () => {
    const subhead = 'Subhead';
    const wrapper = createWrapper({
      slots: {
        subhead,
      },
    });
    const title = wrapper.find('.subhead');
    expect(title.text()).toBe(subhead);
  });
});
