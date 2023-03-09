/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import QuickNavigationButton from 'docc-render/components/Navigator/QuickNavigationButton.vue';

describe('QuickNavigationButton', () => {
  it('renders and behaves like a button', () => {
    const wrapper = shallowMount(QuickNavigationButton);

    expect(wrapper.is('button.quick-navigation-open')).toBe(true);
    expect(wrapper.attributes('aria-label')).toBe('quicknav.button.label');
    expect(wrapper.attributes('title')).toBe('quicknav.button.title');
    expect(wrapper.text()).toBe('/');
  });

  it('behaves like a button', async () => {
    const click = jest.fn();
    const wrapper = shallowMount(QuickNavigationButton, {
      listeners: { click },
    });

    await wrapper.find('button').trigger('click');
    expect(click).toHaveBeenCalled();
  });
});
