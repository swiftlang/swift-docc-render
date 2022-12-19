/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';
import { shallowMount } from '@vue/test-utils';
import scrollToElement from 'docc-render/mixins/scrollToElement';
import { flushPromises } from '../../../test-utils';

jest.mock('docc-render/utils/loading', () => ({ waitFrames: () => {} }));
jest.mock('docc-render/mixins/scrollToElement', () => ({
  methods: { scrollToElement: jest.fn() },
}));

const Component = {
  name: 'MyComponent',
  template: '<div/>',
  mixins: [onPageLoadScrollToFragment],
};

const createWrapper = ({ mocks } = {}) => {
  const mockData = {
    $route: {
      hash: '',
    },
    ...mocks,
  };

  return shallowMount(Component, {
    mocks: mockData,
  });
};

describe('onPageLoadScrollToFragment', () => {
  beforeEach(() => {
    jest.clearAllMocks();
  });

  it('calls scrollToElement on mounted/updated if route has a hash', async () => {
    const wrapper = createWrapper({
      mocks: {
        $route: {
          hash: 'some-hash',
        },
      },
    });
    wrapper.vm.$forceUpdate();
    await flushPromises();
    expect(scrollToElement.methods.scrollToElement).toHaveBeenCalledTimes(2);
    expect(scrollToElement.methods.scrollToElement).toHaveBeenNthCalledWith(1, 'some-hash');
    expect(scrollToElement.methods.scrollToElement).toHaveBeenNthCalledWith(2, 'some-hash');
  });

  it('does not call scrollToElement if no hash exists', () => {
    createWrapper();
    expect(scrollToElement.methods.scrollToElement).not.toHaveBeenCalled();
  });
});
