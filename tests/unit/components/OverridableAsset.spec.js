/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import OverridableAsset from '@/components/OverridableAsset.vue';
import { shallowMount } from '@vue/test-utils';
import ImageAsset from '@/components/ImageAsset.vue';
import SVGIcon from '@/components/SVGIcon.vue';

const localVariantWithID = {
  url: '/foo/bar',
  svgID: 'baz',
};

const localVariantNoID = {
  url: '/baz/bar',
};

const remoteVariant = {
  url: 'http://localhost/foo/bar',
  svgID: 'baz',
};

const remoteDifferentVariant = {
  url: 'http://webiste.com/foo/bar',
  svgID: 'baz',
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(OverridableAsset, {
  propsData,
  ...others,
});

describe('OverridableAsset', () => {
  it('renders an `ImageAsset` component, when there is no svgID', () => {
    const wrapper = createWrapper({
      propsData: {
        imageOverride: {
          variants: [localVariantNoID],
        },
      },
    });
    expect(wrapper.find(ImageAsset).props()).toEqual({
      variants: [localVariantNoID],
      loading: null,
      alt: '',
      shouldCalculateOptimalWidth: true,
    });
  });

  it('renders an `ImageAsset` component, when the domain of the img is different', () => {
    const wrapper = createWrapper({
      propsData: {
        imageOverride: {
          variants: [remoteDifferentVariant],
        },
      },
    });
    expect(wrapper.find(ImageAsset).props('variants')).toEqual([remoteDifferentVariant]);
  });

  it('renders an `SVGIcon` component, if icon has `svgID` and is from a local path', () => {
    const wrapper = createWrapper({
      propsData: {
        imageOverride: {
          variants: [localVariantWithID],
        },
      },
    });
    expect(wrapper.find(SVGIcon).props()).toEqual({
      iconUrl: localVariantWithID.url,
      themeId: localVariantWithID.svgID,
    });
  });

  it('renders an `SVGIcons` component, if icon has svgId and is from same domain', () => {
    const wrapper = createWrapper({
      propsData: {
        imageOverride: {
          variants: [remoteVariant],
        },
      },
    });
    expect(wrapper.find(SVGIcon).props()).toEqual({
      iconUrl: remoteVariant.url,
      themeId: remoteVariant.svgID,
    });
  });
});
