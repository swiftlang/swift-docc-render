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
import Footer from 'docc-render/components/Footer.vue';

const mockEnablei18n = jest.fn().mockReturnValue(false);

jest.mock('docc-render/lang', () => ({
  get enablei18n() { return mockEnablei18n(); },
}));

const { ColorSchemeToggle, LocaleSelector } = Footer.components;

describe('Footer', () => {
  let wrapper;

  beforeEach(() => {
    wrapper = shallowMount(Footer);
  });

  it('renders a <footer>', () => {
    expect(wrapper.is('footer.footer')).toBe(true);
  });

  it('renders a `ColorSchemeToggle`', () => {
    expect(wrapper.contains(ColorSchemeToggle)).toBe(true);
  });

  it('renders LocaleSelector if enablei18n is true', () => {
    expect(wrapper.find(LocaleSelector).exists()).toBe(false);

    // set enablei18n to true
    mockEnablei18n.mockReturnValueOnce(true);
    wrapper = shallowMount(Footer);

    expect(wrapper.find(LocaleSelector).exists()).toBe(true);
  });
});
