/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import IconOverrideProvider from '@/components/IconOverrideProvider.vue';
import { shallowMount } from '@vue/test-utils';

const variant = {
  url: '/foo/bar',
  svgID: 'baz',
};

const variantWithoutId = {
  url: '/baz/bar',
};

const defaultProps = {
  imageOverride: {
    variants: [variant, variantWithoutId],
  },
};
let slotProps = null;
const createWrapper = ({ propsData, ...others } = {}) => shallowMount(IconOverrideProvider, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  scopedSlots: {
    default(props) {
      slotProps = props;
      return this.$createElement('div', 'Default Slot');
    },
  },
  ...others,
});

describe('IconOverrideProvider', () => {
  it('provides data to the default scoped slot', () => {
    const wrapper = createWrapper();
    expect(wrapper.text()).toContain('Default Slot');
    expect(slotProps).toEqual({
      shouldUseOverride: true,
      iconUrl: variant.url,
      themeId: variant.svgID,
    });
  });

  it('sets shouldUseOverride to `false`, if variant has no id', () => {
    createWrapper({
      propsData: {
        imageOverride: {
          variants: [variantWithoutId],
        },
      },
    });
    expect(slotProps).toEqual({
      shouldUseOverride: false,
      iconUrl: variantWithoutId.url,
      themeId: undefined,
    });
  });

  it('sets shouldUseOverride to `false`, if no override passed', () => {
    createWrapper({
      propsData: {
        imageOverride: null,
      },
    });
    expect(slotProps).toEqual({
      shouldUseOverride: false,
      iconUrl: null,
      themeId: null,
    });
  });
});
