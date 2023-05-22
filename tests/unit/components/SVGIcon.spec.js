/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import SVGIcon from '@/components/SVGIcon.vue';
import { shallowMount } from '@vue/test-utils';
import { getSetting } from 'docc-render/utils/theme-settings';

jest.mock('docc-render/utils/theme-settings');

getSetting.mockReturnValue(undefined);

const createWrapper = attrs => shallowMount(SVGIcon, {
  slots: {
    default: '<path d="M8.33"></path>',
  },
  ...attrs,
});

describe('SVGIcon', () => {
  it('renders the SVGIcon with a default slot', () => {
    const wrapper = createWrapper();
    expect(wrapper.attributes()).toEqual({
      'aria-hidden': 'true',
      class: 'svg-icon',
      xmlns: 'http://www.w3.org/2000/svg',
      'xmlns:xlink': 'http://www.w3.org/1999/xlink',
    });
    expect(wrapper.find('path').exists()).toBe(true);
  });

  it('renders an override, if there is a `themeSetting` override', () => {
    getSetting.mockReturnValue('theme/override/path');
    const wrapper = createWrapper({
      propsData: {
        themeId: 'foo',
      },
    });
    expect(wrapper.find('path').exists()).toBe(false);
    expect(wrapper.find('use').attributes()).toEqual({
      width: '100%',
      height: '100%',
      href: 'theme/override/path#foo',
    });
  });

  it('renders an override, if `iconUrl` is passed, overriding `themeSetting` as well', () => {
    getSetting.mockReturnValue('theme/override/path');
    const wrapper = createWrapper({
      propsData: {
        iconUrl: '/path/to/new/icon.svg',
        themeId: 'foo',
      },
    });
    expect(wrapper.find('path').exists()).toBe(false);
    expect(wrapper.find('use').attributes()).toEqual({
      width: '100%',
      height: '100%',
      href: '/path/to/new/icon.svg#foo',
    });
  });
});
