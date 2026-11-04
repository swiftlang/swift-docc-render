/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import NotFound from 'docc-render/views/NotFound.vue';
import { shallowMount } from '@vue/test-utils';
import Language from 'docc-render/constants/Language';
import { fetchData } from 'docc-render/utils/data';
import { flushPromises } from '../../../test-utils';

jest.mock('docc-render/utils/data');

const { GenericError, Reference } = NotFound.components;

describe('NotFound', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders a `GenericError` with a custom message', () => {
    fetchData.mockResolvedValue({ interfaceLanguages: {} });
    const wrapper = shallowMount(NotFound);
    const error = wrapper.findComponent(GenericError);
    expect(error.exists()).toBe(true);
    expect(error.props('message')).toBe('error.not-found');
  });

  it('exposes a default slot', () => {
    fetchData.mockResolvedValue({ interfaceLanguages: {} });
    const wrapper = shallowMount(NotFound, {
      slots: {
        default: '<div class="default">Default Content</div>',
      },
    });
    expect(wrapper.findComponent('.default').text()).toBe('Default Content');
  });

  it('renders the back link when a module is found', async () => {
    fetchData.mockResolvedValue({
      interfaceLanguages: {
        [Language.swift.key.url]: [{ type: 'module', path: '/documentation/swift' }],
      },
    });
    const wrapper = shallowMount(NotFound);
    await flushPromises();
    const backLink = wrapper.findComponent(Reference);
    expect(backLink.exists()).toBe(true);
    expect(backLink.props('url')).toBe('/documentation/swift');
  });

  it('does not render the back link when no module is found', async () => {
    fetchData.mockResolvedValue({
      interfaceLanguages: { [Language.swift.key.url]: [] },
    });
    const wrapper = shallowMount(NotFound);
    await flushPromises();
    expect(wrapper.findComponent(Reference).exists()).toBe(false);
  });

  it('does not render the back link when index fetch fails', async () => {
    fetchData.mockRejectedValue(new Error('Fetch failed'));
    const wrapper = shallowMount(NotFound);
    await flushPromises();
    expect(wrapper.findComponent(Reference).exists()).toBe(false);
  });

  it('uses the first module found across interface languages', async () => {
    fetchData.mockResolvedValue({
      interfaceLanguages: {
        [Language.objectiveC.key.url]: [{ type: 'something-else' }],
        [Language.swift.key.url]: [{ type: 'module', path: '/documentation/swift' }],
      },
    });
    const wrapper = shallowMount(NotFound);
    await flushPromises();
    const backLink = wrapper.findComponent(Reference);
    expect(backLink.exists()).toBe(true);
    expect(backLink.props('url')).toBe('/documentation/swift');
  });
});
