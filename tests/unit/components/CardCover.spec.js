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
import ImageAsset from 'docc-render/components/ImageAsset.vue';

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
  it('renders an `<ImageAsset>`', () => {
    const wrapper = mountCover();
    const asset = wrapper.find(ImageAsset);
    expect(asset.classes()).toContain('card-cover');
    expect(asset.props('variants')).toEqual(defaultProps.variants);
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
