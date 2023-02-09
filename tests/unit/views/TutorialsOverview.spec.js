/**
 * This source file is part of the Swift.org open source project
 *
 * Copyright (c) 2021 Apple Inc. and the Swift project authors
 * Licensed under Apache License v2.0 with Runtime Library Exception
 *
 * See https://swift.org/LICENSE.txt for license information
 * See https://swift.org/CONTRIBUTORS.txt for Swift project authors
*/

import { shallowMount } from '@vue/test-utils';
import TutorialsOverview from 'docc-render/views/TutorialsOverview.vue';
import onPageLoadScrollToFragment from 'docc-render/mixins/onPageLoadScrollToFragment';

jest.mock('docc-render/mixins/onPageLoadScrollToFragment');
const { Overview } = TutorialsOverview.components;

describe('TutorialsOverview', () => {
  let wrapper;

  const mocks = {
    $bridge: { send: jest.fn(), on: jest.fn(), off: jest.fn() },
    $route: { path: '/tutorials/swiftui', params: {} },
  };

  const topicData = {
    identifier: {
      interfaceLanguage: 'swift',
      url: '/tutorials/swiftui',
    },
    metadata: {},
    references: {},
    sections: [],
  };

  beforeEach(() => {
    jest.clearAllMocks();
    wrapper = shallowMount(TutorialsOverview, { mocks });
  });

  it('renders an `Overview` with data', () => {
    wrapper.setData({ topicData });

    const overview = wrapper.find(Overview);
    expect(overview.exists()).toBe(true);
  });

  it('uses the onPageLoadScrollToFragment mixin', () => {
    expect(onPageLoadScrollToFragment.mounted).toHaveBeenCalled();
  });

  it('updates the content on mounted', () => {
    expect(mocks.$bridge.on).toHaveBeenCalledTimes(1);
    expect(mocks.$bridge.on).toHaveBeenCalledWith('contentUpdate', expect.any(Function));
    mocks.$bridge.on.mock.calls[0][1](topicData);
    expect(wrapper.vm.topicData).toEqual(topicData);
    wrapper.destroy();
    expect(mocks.$bridge.off).toHaveBeenCalledTimes(1);
    expect(mocks.$bridge.off).toHaveBeenCalledWith('contentUpdate', expect.any(Function));
  });
});
