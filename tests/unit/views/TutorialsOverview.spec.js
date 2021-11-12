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
    $bridge: { send: jest.fn() },
    $route: { path: '/tutorials/swiftui', params: {} },
  };

  beforeEach(() => {
    wrapper = shallowMount(TutorialsOverview, { mocks });
  });

  it('renders an `Overview` with data', () => {
    const topicData = {
      identifier: {
        interfaceLanguage: 'swift',
        url: '/tutorials/swiftui',
      },
      metadata: {},
      references: {},
      sections: [],
    };
    wrapper.setData({ topicData });

    const overview = wrapper.find(Overview);
    expect(overview.exists()).toBe(true);
  });

  it('uses the onPageLoadScrollToFragment mixin', () => {
    expect(onPageLoadScrollToFragment.mounted).toHaveBeenCalled();
  });
});
