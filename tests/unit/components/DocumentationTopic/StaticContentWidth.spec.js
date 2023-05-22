/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2022 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import StaticContentWidth from '@/components/DocumentationTopic/StaticContentWidth.vue';
import { shallowMount } from '@vue/test-utils';
import throttle from 'docc-render/utils/throttle';
import { createEvent, flushPromises } from '../../../../test-utils';

jest.mock('docc-render/utils/throttle', () => jest.fn(v => v));

const store = {
  setContentWidth: jest.fn(),
};
let wrapper;
const createWrapper = () => {
  wrapper = shallowMount(StaticContentWidth, {
    slots: {
      default: '<div class="default">Default Content</div>',
    },
    provide: {
      store,
    },
  });
  return wrapper;
};

describe('StaticContentWidth', () => {
  beforeEach(() => {
    jest.clearAllMocks();
    if (wrapper) wrapper.destroy();
  });

  it('renders the StaticContentWidth', () => {
    createWrapper();
    expect(wrapper.find('.default').text()).toBe('Default Content');
  });

  it('stores the width in the store, and updates on `resize` and `orientationchange`', async () => {
    createWrapper();
    expect(store.setContentWidth).toHaveBeenCalledTimes(0);
    // define the offsetWidth
    Object.defineProperty(wrapper.element, 'offsetWidth', {
      value: 1200,
      writable: true,
    });

    expect(throttle).toHaveBeenCalledTimes(1);
    expect(throttle).toHaveBeenCalledWith(expect.any(Function), 150);

    await flushPromises();
    // assert it stores on mount
    expect(store.setContentWidth).toHaveBeenCalledTimes(1);
    expect(store.setContentWidth).toHaveBeenCalledWith(1200);

    // assert it tracks window resize
    wrapper.element.offsetWidth = 1100;
    window.dispatchEvent(createEvent('resize'));
    await flushPromises();
    expect(store.setContentWidth).toHaveBeenCalledTimes(2);
    expect(store.setContentWidth).toHaveBeenCalledWith(1100);

    // assert it tracks window orientationchange
    wrapper.element.offsetWidth = 800;
    window.dispatchEvent(createEvent('orientationchange'));
    await flushPromises();
    expect(store.setContentWidth).toHaveBeenCalledTimes(3);
    expect(store.setContentWidth).toHaveBeenCalledWith(800);
    // assert it destroys listeners
    wrapper.destroy();
    wrapper.element.offsetWidth = 1000;
    window.dispatchEvent(createEvent('orientationchange'));
    await flushPromises();
    expect(store.setContentWidth).toHaveBeenCalledTimes(3);
  });
});
