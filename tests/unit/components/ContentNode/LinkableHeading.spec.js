/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount, RouterLinkStub } from '@vue/test-utils';
import LinkableHeading from 'docc-render/components/ContentNode/LinkableHeading.vue';

describe('LinkableHeading', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });
  const stubs = { 'router-link': RouterLinkStub };

  it('renders a default heading that is a h2 by default', () => {
    const wrapper = shallowMount(LinkableHeading, {
      stubs,
      slots: { default: 'Title' },
    });
    expect(wrapper.text()).toBe('Title');
    expect(wrapper.find('h2').exists()).toBe(true);
  });

  it('renders a heading with a given level', () => {
    const wrapper = shallowMount(LinkableHeading, {
      stubs,
      propsData: {
        level: 3,
      },
    });
    expect(wrapper.find('h3').exists()).toBe(true);
  });

  it('renders a heading and an anchor inside a wrapper', async () => {
    const wrapper = shallowMount(LinkableHeading, {
      stubs,
      propsData: {
        anchor: 'title',
      },
      slots: { default: 'Title' },
    });
    await wrapper.vm.$nextTick();
    expect(wrapper.find('.heading').text()).toBe('Title');
    expect(wrapper.find('.heading').attributes('id')).toBe('title');
    expect(wrapper.find('.anchor').props('to')).toEqual({ hash: '#title' });
  });

  it('does not render anchor if there is no anchor', () => {
    const wrapper = shallowMount(LinkableHeading);
    expect(wrapper.find('.anchor').exists()).toBe(false);
  });

  it('does not render anchor if target ide is true', () => {
    const wrapper = shallowMount(LinkableHeading, {
      stubs,
      propsData: {
        anchor: 'title',
      },
      provide: {
        isTargetIDE: true,
      },
    });
    expect(wrapper.find('.anchor').exists()).toBe(false);
  });

  it('does not render anchor if `enableMinimized` is true', () => {
    const wrapper = shallowMount(LinkableHeading, {
      stubs,
      propsData: {
        anchor: 'title',
      },
      provide: {
        enableMinimized: true,
      },
    });
    expect(wrapper.find('.anchor').exists()).toBe(false);
  });
});
