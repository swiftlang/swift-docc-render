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
import InlineImage from 'docc-render/components/ContentNode/InlineImage.vue';
import ImageAsset from 'docc-render/components/ImageAsset.vue';

describe('InlineImage', () => {
  it('renders an ImageAsset with the correct style', () => {
    const alt = 'alt';
    const variants = [
      {
        traits: [
          '2x',
          'light',
        ],
        url: 'url',
        size: {
          width: 1202,
          height: 630,
        },
      },
    ];

    const wrapper = shallowMount(InlineImage, {
      propsData: {
        alt,
        variants,
      },
    });

    const imageAsset = wrapper.find(ImageAsset);
    expect(imageAsset.exists()).toBe(true);
    expect(imageAsset.props('alt')).toBe(alt);
    expect(imageAsset.props('variants')).toBe(variants);
  });
});
