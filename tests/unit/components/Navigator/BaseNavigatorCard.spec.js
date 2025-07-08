/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022-2024 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import BaseNavigatorCard from '@/components/Navigator/BaseNavigatorCard.vue';
import { shallowMount } from '@vue/test-utils';
import { baseNavOpenSidenavButtonId } from 'docc-render/constants/nav';
import { flushPromises } from '../../../../test-utils';

const defaultProps = {
  technology: 'Technology',
  technologyPath: '/path',
  isTechnologyBeta: false,
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(BaseNavigatorCard, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  ...others,
});

describe('BaseNavigatorCard', () => {
  it('renders the BaseNavigatorCard', () => {
    const wrapper = createWrapper();
    expect(wrapper.is('div')).toBe(true);
    expect(wrapper.classes()).toContain('navigator-card');
    expect(wrapper.findComponent('.navigator-card-full-height').exists()).toBe(true);
    expect(wrapper.findComponent('.navigator-card-inner').exists()).toBe(true);
    expect(wrapper.findComponent('.head-wrapper').exists()).toBe(true);
    expect(wrapper.findComponent('.head-inner').exists()).toBe(true);
  });

  it('emits a `close` event, and focuses the open toggle', async () => {
    const btn = document.createElement('BUTTON');
    btn.id = baseNavOpenSidenavButtonId;
    document.body.appendChild(btn);
    const wrapper = createWrapper();
    const button = wrapper.findComponent('.close-card');
    button.trigger('click');
    await flushPromises();
    expect(button.attributes('aria-label')).toBe('navigator.close-navigator');
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(document.activeElement).toEqual(btn);
  });

  it('exposes a #body slot', () => {
    const wrapper = createWrapper({
      scopedSlots: {
        body: '<div :class="props.className">CustomBody</div>',
      },
    });
    expect(wrapper.findComponent('.card-body').text()).toBe('CustomBody');
  });

  it('exposes a #above-navigator-head slot', () => {
    const wrapper = createWrapper({
      scopedSlots: {
        'above-navigator-head': '<div class="above-navigator-head">CustomAboveNavigatorHeadComponent</div>',
      },
    });
    expect(wrapper.findComponent('.above-navigator-head').text()).toBe('CustomAboveNavigatorHeadComponent');
  });

  it('exposes a #navigator-head slot', () => {
    const wrapper = createWrapper({
      scopedSlots: {
        'navigator-head': '<div class="navigator-head">CustomNavigatorHeadComponent</div>',
      },
    });
    expect(wrapper.findComponent('.navigator-head').text()).toBe('CustomNavigatorHeadComponent');
  });
});
