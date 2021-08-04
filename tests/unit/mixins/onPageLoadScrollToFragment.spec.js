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

  it('calls scrollToElement on mount if route has a hash', async () => {
    createWrapper({
      mocks: {
        $route: {
          hash: 'some-hash',
        },
      },
    });
    await Promise.resolve();
    expect(scrollToElement.methods.scrollToElement).toHaveBeenCalledWith('some-hash');
  });

  it('does not call scrollToElement if no hash exists', () => {
    createWrapper();
    expect(scrollToElement.methods.scrollToElement).not.toHaveBeenCalled();
  });
});
