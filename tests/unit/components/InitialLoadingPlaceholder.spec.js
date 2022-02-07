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

const onReady = jest.fn();

const mocks = {
  $router: {
    onReady,
  },
};

describe('InitialLoadingPlaceholder', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('renders the InitialLoadingPlaceholder', () => {
    const wrapper = shallowMount(InitialLoadingPlaceholder, {
      mocks,
    });
    expect(wrapper.attributes()).toEqual({
      id: 'loading-placeholder',
      class: 'InitialLoadingPlaceholder',
    });
    expect(onReady).toHaveBeenCalledTimes(1);
    // call the registered callback for `onReady`
    onReady.mock.calls[0][0].call();
    expect(wrapper.html()).toBeFalsy();
  });

  it('sets the placeholder as ready, even if the router fails to load', () => {
    const wrapper = shallowMount(InitialLoadingPlaceholder, {
      mocks,
    });
    expect(wrapper.html()).toBeTruthy();
    expect(onReady).toHaveBeenCalledTimes(1);
    // call the registered error callback for `onReady`
    onReady.mock.calls[0][1].call();
    expect(wrapper.html()).toBeFalsy();
  });
});
