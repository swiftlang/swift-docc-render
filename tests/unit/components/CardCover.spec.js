/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import CardCover from 'docc-render/components/CardCover.vue';

const lightVariant = {
  url: 'https://image.light',
  size: { width: 42, height: 42 },
  traits: ['1x', '2x', 'light'],
};
const darkVariant = {
  url: 'https://image.dark',
  size: { width: 42, height: 42 },
  traits: ['1x', '2x', 'dark'],
};
const variants = [lightVariant, darkVariant];

const defaultProps = {
  variants,
};

const mountCover = ({ propsData, ...rest } = {}) => {
  const config = {
    propsData: {
      ...defaultProps,
      ...propsData,
    },
    ...rest,
  };
  return shallowMount(CardCover, config);
};

describe('CardCover', () => {
  it('renders images for light/dark backgrounds', () => {
    const wrapper = mountCover();
    const covers = wrapper.findAll('.card-cover');
    expect(covers).toHaveLength(2);
    expect(wrapper.find('.card-cover--light').attributes('style'))
      .toContain(`background-image: url(${lightVariant.url});`);
    expect(wrapper.find('.card-cover--dark').attributes('style'))
      .toContain(`background-image: url(${darkVariant.url});`);
  });

  it('falls back to light image if dark variant is not available', () => {
    const wrapper = mountCover({
      propsData: {
        variants: [lightVariant],
      },
    });
    expect(wrapper.find('.card-cover--dark').attributes('style')).toContain(lightVariant.url);
  });

  it('exposes a default slot', () => {
    let slotProps = null;
    const wrapper = mountCover({
      scopedSlots: {
        default: (props) => {
          slotProps = props;
          return 'Slot Content';
        },
      },
    });
    expect(wrapper.find('.card-cover').exists()).toBe(false);
    expect(slotProps).toEqual({
      classes: 'card-cover',
    });
    expect(wrapper.text()).toBe('Slot Content');
  });
});
