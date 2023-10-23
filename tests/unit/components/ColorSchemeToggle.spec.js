/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021-2023 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import AppStore from 'docc-render/stores/AppStore';
import ColorScheme from 'docc-render/constants/ColorScheme';
import ColorSchemeToggle from 'docc-render/components/ColorSchemeToggle.vue';

jest.mock('docc-render/stores/AppStore', () => ({
  setPreferredColorScheme: jest.fn(),
}));

describe('ColorSchemeToggle', () => {
  let wrapper;

  const {
    auto,
    dark,
    light,
  } = ColorScheme;

  beforeEach(() => {
    wrapper = shallowMount(ColorSchemeToggle, {
      data: () => ({
        appState: {
          preferredColorScheme: auto,
          supportsAutoColorScheme: true,
        },
      }),
      attachToDocument: true,
    });
  });

  it('renders a fieldset .color-scheme-toggle', () => {
    expect(wrapper.is('fieldset.color-scheme-toggle'));
  });

  it('renders a legend for fieldset', () => {
    const legend = wrapper.find('legend');
    expect(legend.exists()).toBe(true);
    expect(legend.text()).toBe('color-scheme.select');
  });

  it('renders a label for "Light/Dark/Auto"', () => {
    const labels = wrapper.findAll('label');
    expect(labels.length).toBe(3);

    expect(labels.at(0).text()).toBe('color-scheme.light');
    expect(labels.at(1).text()).toBe('color-scheme.dark');
    expect(labels.at(2).text()).toBe('color-scheme.auto');
  });

  it('renders radio buttons checked according to the preferred color scheme', () => {
    const inputs = wrapper.findAll('input[type="radio"]');
    expect(inputs.length).toBe(3);

    expect(inputs.at(0).attributes('value')).toBe(light);
    expect(inputs.at(1).attributes('value')).toBe(dark);
    expect(inputs.at(2).attributes('value')).toBe(auto);
    expect(inputs.at(0).element.checked).toBe(false);
    expect(inputs.at(1).element.checked).toBe(false);
    expect(inputs.at(2).element.checked).toBe(true);

    wrapper.setData({
      appState: { preferredColorScheme: dark },
    });
    expect(inputs.at(0).element.checked).toBe(false);
    expect(inputs.at(1).element.checked).toBe(true);
    expect(inputs.at(2).element.checked).toBe(false);

    wrapper.setData({
      appState: { preferredColorScheme: light },
    });
    expect(inputs.at(0).element.checked).toBe(true);
    expect(inputs.at(1).element.checked).toBe(false);
    expect(inputs.at(2).element.checked).toBe(false);
  });

  it('sets the preferred color scheme when a radio button is checked', () => {
    const darkInput = wrapper.findAll('input[type="radio"]').at(1);
    darkInput.setChecked();
    expect(AppStore.setPreferredColorScheme).toHaveBeenCalledWith(dark);
  });

  it('sets body[data-color-scheme] to match the preferred color scheme', () => {
    expect(document.body.dataset.colorScheme).toBe(auto);
    wrapper.setData({
      appState: { preferredColorScheme: dark },
    });
    expect(document.body.dataset.colorScheme).toBe(dark);
  });

  it('only render Light/Dark options when Auto is not supported by device', () => {
    wrapper.setData({
      appState: {
        preferredColorScheme: light,
        supportsAutoColorScheme: false,
      },
    });
    const labels = wrapper.findAll('label');
    expect(labels.length).toBe(2);

    expect(labels.at(0).text()).toBe('color-scheme.light');
    expect(labels.at(1).text()).toBe('color-scheme.dark');
  });
});
