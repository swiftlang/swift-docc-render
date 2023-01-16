/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import DeviceFrame from '@/components/ContentNode/DeviceFrame.vue';
import { shallowMount } from '@vue/test-utils';
import DeviceFrames from '@/constants/DeviceFrames';
import { getSetting } from '@/utils/theme-settings';

jest.mock('@/utils/theme-settings');
jest.mock('@/constants/DeviceFrames', () => ({
  phone: {
    screenTop: 15,
    screenWidth: 210,
    screenHeight: 460,
    screenLeft: 15,

    frameWidth: 240,
    frameHeight: 490,
    lightUrl: 'path/to/phone.svg',
  },
  tablet: {
    screenTop: 22,
    screenWidth: 590,
    screenHeight: 410,
    screenLeft: 22,

    frameWidth: 640,
    frameHeight: 460,
    lightUrl: 'path/to/tablet.svg',
  },
  // the TV may have a stand, which means it has diff top/bottom offsets
  tv: {
    screenTop: 8,
    screenWidth: 600,
    screenHeight: 300,
    screenLeft: 8,

    frameWidth: 630,
    frameHeight: 370,
    lightUrl: 'path/to/tv.svg',
  },
  invalid: {
    screenTop: 8,
    screenWidth: 600,
    screenHeight: 300,
    screenLeft: 8,

    framewidth: 630, // invalid name
    'frame-height': '370',
    lightUrl: 'path/to/tv.svg',
  },
}));

// return the fallback by default
getSetting.mockImplementation((path, fallback) => fallback);

const defaultProps = {
  device: 'phone',
};

const createWrapper = ({ propsData, ...others } = {}) => shallowMount(DeviceFrame, {
  propsData: {
    ...defaultProps,
    ...propsData,
  },
  slots: {
    default: '<div class="default-slot-content">Default Slot</div>',
  },
  ...others,
});

const phoneStyles = {
  '--device-dark-url': null,
  '--device-light-url': 'url(path/to/phone.svg)',
  '--frame-aspect': 0.4898,
  '--frame-width': '240px',
  '--screen-aspect': 0.4565,
  '--screen-height': '93.8776%',
  '--screen-left': '6.25%',
  '--screen-top': '3.0612%',
  '--screen-width': '87.5%',
};
const tabletStyles = {
  '--device-dark-url': null,
  '--device-light-url': 'url(path/to/tablet.svg)',
  '--frame-aspect': 1.3913,
  '--frame-width': '640px',
  '--screen-aspect': 1.439,
  '--screen-height': '89.1304%',
  '--screen-left': '3.4375%',
  '--screen-top': '4.7826%',
  '--screen-width': '92.1875%',
};

describe('DeviceFrame', () => {
  it('renders the DeviceFrame', () => {
    const wrapper = createWrapper();
    expect(wrapper.attributes('data-device')).toBe('phone');
    const deviceScreen = wrapper.find('.device-screen');
    expect(deviceScreen.classes()).toContain('with-device');
    expect(deviceScreen.find('.default-slot-content').text()).toBe('Default Slot');
    expect(wrapper.find('.device').exists()).toBe(true);
  });

  it('exposes the correct css variables', () => {
    const wrapper = createWrapper();
    expect(wrapper.vm.styles).toEqual(phoneStyles);
  });

  it('renders fine, if no device frame is found', () => {
    const wrapper = createWrapper({
      propsData: {
        device: 'TV',
      },
    });
    expect(wrapper.attributes('data-device')).toBe('TV');
    expect(wrapper.classes()).toContain('no-device');
    expect(wrapper.find('.device-screen').classes()).not.toContain('with-device');
    expect(wrapper.vm.styles).toMatchObject({
      '--frame-aspect': null,
      '--frame-width': null,
      '--screen-aspect': null,
      '--screen-height': null,
      '--screen-left': null,
      '--screen-top': null,
      '--screen-width': null,
    });
  });

  it('renders fine, if device frame is invalid', () => {
    const wrapper = createWrapper({
      propsData: {
        device: 'invalid',
      },
    });
    expect(wrapper.attributes('data-device')).toBe('invalid');
    expect(wrapper.classes()).not.toContain('no-device');
    expect(wrapper.vm.styles).toMatchObject({
      '--frame-aspect': null,
      '--frame-width': null,
      '--screen-aspect': 2,
      '--screen-height': null,
      '--screen-left': null,
      '--screen-top': null,
      '--screen-width': null,
    });
  });

  it('returns frames from the theme-settings', () => {
    getSetting.mockImplementationOnce(() => DeviceFrames.tablet);
    const wrapper = createWrapper({
      propsData: {
        device: 'custom-tablet',
      },
    });
    expect(getSetting).toHaveBeenCalledWith(['theme', 'device-frames', 'custom-tablet'], undefined);
    expect(wrapper.attributes('data-device')).toBe('custom-tablet');
    expect(wrapper.vm.styles).toEqual(tabletStyles);
  });
});
