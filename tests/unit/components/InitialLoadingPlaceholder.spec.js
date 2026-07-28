/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import InitialLoadingPlaceholder from 'docc-render/components/InitialLoadingPlaceholder.vue';
import { shallowMount } from '@vue/test-utils';
import { flushPromises } from '../../../test-utils';

const isReady = vi.fn();

const mocks = {
  $router: {
    isReady,
  },
};

describe('InitialLoadingPlaceholder', () => {
  beforeEach(() => {
    vi.clearAllMocks();
    isReady.mockResolvedValue();
  });

  it('renders the InitialLoadingPlaceholder', async () => {
    const wrapper = shallowMount(InitialLoadingPlaceholder, {
      mocks,
    });
    expect(wrapper.attributes()).toEqual({
      id: 'loading-placeholder',
      class: 'InitialLoadingPlaceholder',
    });
    expect(isReady).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(wrapper.html()).toBe('<!--v-if-->');
  });

  it('sets the placeholder as ready, even if the router fails to load', async () => {
    isReady.mockRejectedValue(new Error('Router failed to load'));
    const wrapper = shallowMount(InitialLoadingPlaceholder, {
      mocks,
    });
    expect(wrapper.html()).toBeTruthy();
    expect(isReady).toHaveBeenCalledTimes(1);
    await flushPromises();
    expect(wrapper.html()).toBe('<!--v-if-->');
  });
});
