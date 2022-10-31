/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import BaseNavigatorCard from '@/components/Navigator/BaseNavigatorCard.vue';
import { shallowMount } from '@vue/test-utils';
import { baseNavOpenSidenavButtonId } from 'docc-render/constants/nav';
import { flushPromises } from '../../../../test-utils';

const { Reference, Badge } = BaseNavigatorCard.components;

const defaultProps = {
  allowHiding: true,
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
    expect(wrapper.find('.navigator-card-full-height').exists()).toBe(true);
    expect(wrapper.find('.navigator-card-inner').exists()).toBe(true);
    expect(wrapper.find('.head-wrapper').exists()).toBe(true);
    expect(wrapper.find('.head-inner').exists()).toBe(true);
  });

  it('emits a `close` event, and focuses the open toggle', async () => {
    const btn = document.createElement('BUTTON');
    btn.id = baseNavOpenSidenavButtonId;
    document.body.appendChild(btn);
    const wrapper = createWrapper();
    const button = wrapper.find('.close-card');
    button.trigger('click');
    await flushPromises();
    expect(button.attributes('aria-label')).toBe('Close documentation navigator');
    expect(wrapper.emitted('close')).toHaveLength(1);
    expect(document.activeElement).toEqual(btn);
  });

  it('hides the toggle button, if `allowHiding` is `false`', async () => {
    const wrapper = createWrapper({
      propsData: {
        allowHiding: false,
      },
    });
    expect(wrapper.find('.close-card').classes()).toContain('hide-on-large');
  });

  it('renders a Beta badge in the header', async () => {
    const wrapper = createWrapper({
      propsData: {
        isTechnologyBeta: true,
      },
    });
    await flushPromises();
    expect(wrapper.find('.navigator-head').find(Badge).props()).toMatchObject({
      variant: 'beta',
    });
  });

  it('renders a card-link with the technology name', () => {
    const wrapper = createWrapper();
    expect(wrapper.find(Reference).props('url')).toEqual(defaultProps.technologyPath);
    expect(wrapper.find('.card-link').text()).toBe(defaultProps.technology);
    expect(wrapper.find('.card-link').is('h2')).toBe(true);
  });

  it('exposes a #body slot', () => {
    const wrapper = createWrapper({
      scopedSlots: {
        body: '<div :class="props.className">CustomBody</div>',
      },
    });
    expect(wrapper.find('.card-body').text()).toBe('CustomBody');
  });
});
